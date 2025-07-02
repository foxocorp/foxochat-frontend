import {
	createContext,
	useCallback,
	useContext,
	useState,
} from "preact/compat";
import { useLocation } from "preact-iso";
import { PageTransitionContextType, PageTransitionProviderProps } from "@interfaces/interfaces"

const PageTransitionContext = createContext<PageTransitionContextType | null>(
	null,
);

export const usePageTransitionContext = () => {
	const context = useContext(PageTransitionContext);
	if (!context) {
		throw new Error(
			"usePageTransitionContext must be used within PageTransitionProvider",
		);
	}
	return context;
};

export const PageTransitionProvider = ({
	children,
}: PageTransitionProviderProps) => {
	const [isTransitioning, setIsTransitioning] = useState(false);
	const location = useLocation();

	const startTransition = useCallback(
		(to: string) => {
			setIsTransitioning(true);
			setTimeout(() => {
				location.route(to);
				setTimeout(() => {
					setIsTransitioning(false);
				}, 100);
			}, 300);
		},
		[location],
	);

	return (
		<PageTransitionContext.Provider
			value={{ isTransitioning, startTransition }}
		>
			{children}
		</PageTransitionContext.Provider>
	);
};
