import { useLocation } from "preact-iso";
import { useEffect } from "preact/hooks";

export const ChannelsRedirect = () => {
    const location = useLocation();
    useEffect(() => {
        location.route('/channels/@me', true);
    }, [location]);

    return null;
} 