import { tv, type VariantProps } from 'tailwind-variants';

export const skeletonVariants = tv({
	base: 'animate-pulse rounded-md bg-muted',
	variants: {
		variant: {
			default: '',
			circle: 'rounded-full',
			text: 'h-4'
		}
	},
	defaultVariants: {
		variant: 'default'
	}
});

export type SkeletonProps = VariantProps<typeof skeletonVariants> & {
	class?: string;
};
