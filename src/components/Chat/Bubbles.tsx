import { render, type ContainerNode } from "preact";
import styles from "@components/Chat/Bubbles/Bubbles.module.scss";
import { CopyBubbleProps, CopyBubbleComponent } from "@interfaces/interfaces";

export const CopyBubble: CopyBubbleComponent = ({ show, text, duration = 1500, onHide }: CopyBubbleProps) => {
    const staticBubble = CopyBubble.activeBubble;

    if (staticBubble) {
        if (!show) {
            render(null, staticBubble.container);
            if (document.body.contains(staticBubble.container)) {
                document.body.removeChild(staticBubble.container);
            }
            clearTimeout(staticBubble.timer);
            CopyBubble.activeBubble = null;
            return null;
        }

        if (staticBubble.props.text !== text || staticBubble.props.duration !== duration) {
            clearTimeout(staticBubble.timer);
            render(
                <div className={styles["bubble"]} style={{ animationDuration: `${duration}ms` }}>
                    <span>{text}</span>
                </div>,
                staticBubble.container,
            );
            staticBubble.timer = window.setTimeout(() => {
                render(null, staticBubble.container);
                if (document.body.contains(staticBubble.container)) {
                    document.body.removeChild(staticBubble.container);
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
    document.body.appendChild(container);

    render(
        <div className={styles["bubble"]} style={{ animationDuration: `${duration}ms` }}>
            <span>{text}</span>
        </div>,
        container,
    );

    const timer = window.setTimeout(() => {
        render(null, container);
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
        CopyBubble.activeBubble = null;
        onHide?.();
    }, duration);

    CopyBubble.activeBubble = { container, timer, props: { show, text, duration, onHide } };

    return () => {
        render(null, container);
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
        clearTimeout(timer);
        CopyBubble.activeBubble = null;
    };
};

CopyBubble.activeBubble = null;