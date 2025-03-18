import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
interface HeroSectionProps {
title: string;
tagline: string;
imageSrc: string;
imageAlt: string;
className?: string;
}
const HeroSection: React.FC<HeroSectionProps> = ({
title,
tagline,
imageSrc,
imageAlt,
className,
}) => {
return (
<section className={cn("relative w-full h-[70vh] min-h-[500px] overflow-hidden", className)}>
<div className="absolute inset-0 w-full h-full">
<Image
src={imageSrc}
alt={imageAlt}
fill
priority
className="object-cover"
/>
<div className="absolute inset-0 bg-primary/30 mix-blend-multiply" />
</div>
<div className="relative h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center z-10">
<h1
className="font-['Playfair_Display'] text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-4 tracking-tight"
style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
>
{title}
</h1>
<p
className="font-['Montserrat'] text-lg md:text-xl text-background max-w-2xl"
style={{ textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)' }}
>
{tagline}
</p>
</div>
</section>
);
};
export default HeroSection;