import styles from "./MessageLoader.module.scss";

const MessageLoader = () => {
    return (
        <div className={styles.loaderWrapper}>
            <div className={styles.spinner} />
        </div>
    );
};

export default MessageLoader;
