import { Body1, Body1Strong, Caption1, Link, makeStyles, tokens } from '@fluentui/react-components';
import { Open16Regular, PlayCircle20Regular, DocumentPdf20Regular } from '@fluentui/react-icons';
import { getCoursesForOffer, MASTERING_HUB_URL } from '../data/resources';

const useStyles = makeStyles({
  wrap: { display: 'flex', flexDirection: 'column', gap: '12px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px'
  },
  card: {
    padding: '18px',
    borderRadius: '8px',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  cardHead: { display: 'flex', flexDirection: 'column', gap: '4px' },
  modules: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' },
  moduleRow: { display: 'flex', flexDirection: 'column', gap: '2px' },
  moduleTitle: { color: tokens.colorNeutralForeground2 },
  links: { display: 'flex', gap: '14px', flexWrap: 'wrap' },
  linkItem: { display: 'inline-flex', alignItems: 'center', gap: '4px' },
  landing: { display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' },
  hubNote: { color: tokens.colorNeutralForeground3 }
});

interface Props {
  /** Offer type ID to surface relevant courses for. Omit for general resources only. */
  offerTypeId?: string;
  /** When true, limits each course to its first two modules to keep the surface compact. */
  compact?: boolean;
}

export function LearningResources({ offerTypeId, compact }: Props) {
  const styles = useStyles();
  const courses = getCoursesForOffer(offerTypeId);

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {courses.map((course) => {
          const modules = compact ? course.modules.slice(0, 2) : course.modules;
          return (
            <div key={course.id} className={styles.card}>
              <div className={styles.cardHead}>
                <Body1Strong>{course.title}</Body1Strong>
                <Caption1 className={styles.moduleTitle}>{course.description}</Caption1>
              </div>

              {modules.length > 0 && (
                <div className={styles.modules}>
                  {modules.map((m) => (
                    <div key={m.title} className={styles.moduleRow}>
                      <Caption1 className={styles.moduleTitle}>{m.title}</Caption1>
                      <div className={styles.links}>
                        {m.videoUrl && (
                          <Link
                            className={styles.linkItem}
                            href={m.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <PlayCircle20Regular /> Video
                          </Link>
                        )}
                        {m.pdfUrl && (
                          <Link
                            className={styles.linkItem}
                            href={m.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <DocumentPdf20Regular /> PDF
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link
                className={styles.landing}
                href={course.url}
                target="_blank"
                rel="noreferrer"
              >
                Open course <Open16Regular />
              </Link>
            </div>
          );
        })}
      </div>

      <Body1 className={styles.hubNote}>
        More guidance, demos and downloads are available in{' '}
        <Link href={MASTERING_HUB_URL} target="_blank" rel="noreferrer">
          Mastering the Marketplace
        </Link>
        .
      </Body1>
    </div>
  );
}
