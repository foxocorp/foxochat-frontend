import { render, type ContainerNode } from "preact";
import styles from "./Bubbles.module.scss";
import { CopyBubbleProps, CopyBubbleComponent } from "@interfaces/interfaces";

const CopyBubble: CopyBubbleComponent = ({
                                                    show,
                                                    text,
                                                    duration = 1500,
                                                    onHide }: CopyBubbleProps) => {
    const staticBubble = CopyBubble.activeBubble;

    if (staticBubble) {
        if (!show) {
            render(null, staticBubble.container);
            if (document.body.contains(staticBubble.container as Node)) {
                document.body.removeChild(staticBubble.container as Node);
            }
            clearTimeout(staticBubble.timer);
            CopyBubble.activeBubble = null;
            return null;
        }

        if (staticBubble.props.text !== text || staticBubble.props.duration !== duration) {
            clearTimeout(staticBubble.timer);
            render(
                <div className={styles.bubble} style={{ animationDuration: `${duration}ms` }}>
                    <span>{text}</span>
                </div>,
                staticBubble.container,
            );
            staticBubble.timer = window.setTimeout(() => {
                render(null, staticBubble.container);
                if (document.body.contains(staticBubble.container as Node)) {
                    document.body.removeChild(staticBubble.container as Node);
                }
                CopyBubble.activeBubble = null;
                onHide?.();
            }, duration);
            staticBubble.props = { show, text, duration, onHide };
        }

        return null;
    }

    if (!show) return null;

    const container: ContainerNode = document.createElement("div");
    document.body.appendChild(container as Node);

    render(
        <div className={styles.bubble} style={{ animationDuration: `${duration}ms` }}>
            <span>{text}</span>
        </div>,
        container,
    );

    const timer = window.setTimeout(() => {
        render(null, container);
        if (document.body.contains(container as Node)) {
            document.body.removeChild(container as Node);
        }
        CopyBubble.activeBubble = null;
        onHide?.();
    }, duration);

    CopyBubble.activeBubble = { container, timer, props: { show, text, duration, onHide } };

    return () => {
        render(null, container);
        if (document.body.contains(container as Node)) {
            document.body.removeChild(container as Node);
        }
        clearTimeout(timer);
        CopyBubble.activeBubble = null;
    };
};

CopyBubble.activeBubble = null

export default CopyBubble;