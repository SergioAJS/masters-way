import {Link as LinkFromRouter} from "react-router-dom";
import styles from "src/component/link/Link.module.scss";

/**
 * Link props
 */
interface LinkProps {

  /**
   * Link value (text)
   */
  value: string;

  /**
   * Go to path page on link
   */
  path: string;
}

/**
 * Link component
 */
export const Link = (props: LinkProps) => {
  return (
    <LinkFromRouter
      className={styles.link}
      to={props.path}
    >
      {props.value}
    </LinkFromRouter>
  );
};