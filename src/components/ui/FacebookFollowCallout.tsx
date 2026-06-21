import facebookIcon from '@/assets/icons/facebook.svg';
import styles from './FacebookFollowCallout.module.css';

const FACEBOOK_URL = 'https://www.facebook.com/hoensogfoder';

function FacebookFollowCallout() {
  return (
    <div className={styles.root}>
      <a
        aria-describedby="facebook-follow-label"
        aria-label="Følg Høns og Foder på Facebook (åbner i en ny fane)"
        className={styles.link}
        href={FACEBOOK_URL}
        rel="noreferrer"
        target="_blank"
      >
        <img alt="" aria-hidden="true" className={styles.icon} src={facebookIcon} />
      </a>

      <span className={styles.callout} id="facebook-follow-label">
        Følg os på Facebook
      </span>
    </div>
  );
}

export default FacebookFollowCallout;
