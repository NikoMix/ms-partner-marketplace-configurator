import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ListingOptionId } from '../data/types';
import {
  DEFAULT_AI_SETTINGS,
  DEFAULT_BASE_PROMPT,
  DEFAULT_FIELD_PROMPTS,
  DEFAULT_REFINE_PROMPT,
  type AiSettings
} from '../ai/prompts';

// ---------------------------------------------------------------------------
// Step model
// ---------------------------------------------------------------------------

export interface StepDef {
  id: string;
  label: string;
}

export const STEPS: StepDef[] = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'decide', label: 'Offer type' },
  { id: 'overview', label: 'Requirements' },
  { id: 'listing', label: 'Listing details' },
  { id: 'assets', label: 'Assets' },
  { id: 'billing', label: 'Billing & plans' },
  { id: 'summary', label: 'Summary' }
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface PlanConfig {
  id: string;
  name: string;
  billingModelId: string;
  price: string;
  cadence: string;
  notes: string;
}

export interface SystemPrompts {
  base: string;
  refine: string;
  fields: Record<string, string>;
}

export interface WizardState {
  stepIndex: number;
  categoryId?: string;
  /** questionId -> optionId */
  answers: Record<string, string>;
  offerTypeId?: string;
  listingOptionId?: ListingOptionId;
  /** field id -> value */
  fieldValues: Record<string, string>;
  selectedBillingModelIds: string[];
  plans: PlanConfig[];
  /** asset spec id -> data URL (PNG) */
  assets: Record<string, string>;
  ai: AiSettings;
  prompts: SystemPrompts;
}

const initialPrompts: SystemPrompts = {
  base: DEFAULT_BASE_PROMPT,
  refine: DEFAULT_REFINE_PROMPT,
  fields: { ...DEFAULT_FIELD_PROMPTS }
};

const initialState: WizardState = {
  stepIndex: 0,
  answers: {},
  fieldValues: {},
  selectedBillingModelIds: [],
  plans: [],
  assets: {},
  ai: { ...DEFAULT_AI_SETTINGS },
  prompts: initialPrompts
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: 'GO_TO'; index: number }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SELECT_CATEGORY'; categoryId: string }
  | { type: 'ANSWER'; questionId: string; optionId: string }
  | { type: 'SET_OFFER_TYPE'; offerTypeId: string }
  | { type: 'SET_LISTING_OPTION'; listingOptionId: ListingOptionId }
  | { type: 'SET_FIELD'; fieldId: string; value: string }
  | { type: 'TOGGLE_BILLING'; billingModelId: string }
  | { type: 'ADD_PLAN'; plan: PlanConfig }
  | { type: 'UPDATE_PLAN'; plan: PlanConfig }
  | { type: 'REMOVE_PLAN'; planId: string }
  | { type: 'SET_ASSET'; specId: string; dataUrl: string }
  | { type: 'REMOVE_ASSET'; specId: string }
  | { type: 'SET_AI'; ai: Partial<AiSettings> }
  | { type: 'SET_BASE_PROMPT'; value: string }
  | { type: 'SET_REFINE_PROMPT'; value: string }
  | { type: 'SET_FIELD_PROMPT'; fieldId: string; value: string }
  | { type: 'RESET_PROMPTS' }
  | { type: 'RESET_ALL' }
  | { type: 'HYDRATE'; state: WizardState };

const lastStep = STEPS.length - 1;

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case 'GO_TO':
      return { ...state, stepIndex: clampStep(action.index) };
    case 'NEXT':
      return { ...state, stepIndex: clampStep(state.stepIndex + 1) };
    case 'BACK':
      return { ...state, stepIndex: clampStep(state.stepIndex - 1) };
    case 'SELECT_CATEGORY':
      // Changing category clears any downstream answers/offer selection.
      return { ...state, categoryId: action.categoryId, answers: {}, offerTypeId: undefined };
    case 'ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.optionId }
      };
    case 'SET_OFFER_TYPE':
      if (state.offerTypeId === action.offerTypeId) return state;
      // New offer type → reset billing selection & plans (they are offer-specific).
      return {
        ...state,
        offerTypeId: action.offerTypeId,
        listingOptionId: undefined,
        selectedBillingModelIds: [],
        plans: []
      };
    case 'SET_LISTING_OPTION':
      return { ...state, listingOptionId: action.listingOptionId };
    case 'SET_FIELD':
      return { ...state, fieldValues: { ...state.fieldValues, [action.fieldId]: action.value } };
    case 'TOGGLE_BILLING': {
      const has = state.selectedBillingModelIds.includes(action.billingModelId);
      return {
        ...state,
        selectedBillingModelIds: has
          ? state.selectedBillingModelIds.filter((id) => id !== action.billingModelId)
          : [...state.selectedBillingModelIds, action.billingModelId]
      };
    }
    case 'ADD_PLAN':
      return { ...state, plans: [...state.plans, action.plan] };
    case 'UPDATE_PLAN':
      return {
        ...state,
        plans: state.plans.map((p) => (p.id === action.plan.id ? action.plan : p))
      };
    case 'REMOVE_PLAN':
      return { ...state, plans: state.plans.filter((p) => p.id !== action.planId) };
    case 'SET_ASSET':
      return { ...state, assets: { ...state.assets, [action.specId]: action.dataUrl } };
    case 'REMOVE_ASSET': {
      const next = { ...state.assets };
      delete next[action.specId];
      return { ...state, assets: next };
    }
    case 'SET_AI':
      return { ...state, ai: { ...state.ai, ...action.ai } };
    case 'SET_BASE_PROMPT':
      return { ...state, prompts: { ...state.prompts, base: action.value } };
    case 'SET_REFINE_PROMPT':
      return { ...state, prompts: { ...state.prompts, refine: action.value } };
    case 'SET_FIELD_PROMPT':
      return {
        ...state,
        prompts: {
          ...state.prompts,
          fields: { ...state.prompts.fields, [action.fieldId]: action.value }
        }
      };
    case 'RESET_PROMPTS':
      return {
        ...state,
        prompts: {
          base: DEFAULT_BASE_PROMPT,
          refine: DEFAULT_REFINE_PROMPT,
          fields: { ...DEFAULT_FIELD_PROMPTS }
        }
      };
    case 'RESET_ALL':
      return { ...initialState, ai: state.ai, prompts: state.prompts };
    case 'HYDRATE':
      return action.state;
    default:
      return state;
  }
}

function clampStep(index: number): number {
  if (index < 0) return 0;
  if (index > lastStep) return lastStep;
  return index;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'mp-wizard-state-v1';

function loadPersisted(): WizardState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<WizardState>;
    // Merge with defaults so newly added fields are always present.
    return {
      ...initialState,
      ...parsed,
      ai: { ...initialState.ai, ...(parsed.ai ?? {}) },
      prompts: {
        base: parsed.prompts?.base ?? initialState.prompts.base,
        refine: parsed.prompts?.refine ?? initialState.prompts.refine,
        fields: { ...initialState.prompts.fields, ...(parsed.prompts?.fields ?? {}) }
      }
    };
  } catch {
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface WizardContextValue {
  state: WizardState;
  dispatch: React.Dispatch<Action>;
}

const WizardContext = createContext<WizardContextValue | undefined>(undefined);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => loadPersisted() ?? init);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota / serialization errors */
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within a WizardProvider');
  return ctx;
}
