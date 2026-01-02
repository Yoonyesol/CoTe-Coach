import { Variants } from 'framer-motion';

export const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

export const getModalVariants = (isMobile: boolean): Variants => {
    if (isMobile) {
        // Mobile: Bottom Sheet (Slide up)
        return {
            hidden: { y: "100%", opacity: 0.5 },
            visible: {
                y: 0,
                opacity: 1,
                transition: { type: "spring", damping: 25, stiffness: 300 }
            },
            exit: {
                y: "100%",
                opacity: 0.5,
                transition: { type: "spring", damping: 25, stiffness: 300 }
            }
        };
    }

    // Desktop: Center Popup (Subtle Zoom & Fade)
    return {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { duration: 0.15, ease: "easeOut" }
        },
        exit: {
            scale: 0.95,
            opacity: 0,
            transition: { duration: 0.1, ease: "easeIn" }
        }
    };
};
