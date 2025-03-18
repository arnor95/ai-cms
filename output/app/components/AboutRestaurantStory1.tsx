import React from 'react';
import { cn } from '@/lib/utils';
interface AboutSectionProps {
title?: string;
subtitle?: string;
description?: string | React.ReactNode;
className?: string;
}
const AboutSection: React.FC<AboutSectionProps> = ({
title = "Our Story",
subtitle = "Tradition & Innovation",
description,
className,
}) => {
const defaultDescription = (
<>
<p className="mb-4">
Founded in 2005, our restaurant began with a simple vision: to create a dining experience that celebrates the rich culinary heritage of our region while embracing modern techniques and flavors.
</p>
<p className="mb-4">
We believe that exceptional food starts with exceptional ingredients. That's why we partner with local farmers and producers who share our commitment to sustainability and quality. Every morning, we select the freshest seasonal produce, ethically-sourced meats, and artisanal products to craft our ever-evolving menu.
</p>
<p>
Our philosophy is rooted in respect—respect for ingredients, for tradition, for our environment, and for our guests. We strive to create dishes that not only delight the palate but also tell a story about our land, our heritage, and our passion for culinary excellence.
</p>
</>
);
return (
<section className={cn("py-16 px-4 bg-[#F1EDEA]", className)}>
<div className="max-w-3xl mx-auto">
<h2 className="text-4xl md:text-5xl font-bold mb-3 text-[#4A6C6F] font-['Playfair_Display',serif]">
{title}
</h2>
<h3 className="text-xl md:text-2xl mb-6 text-[#846C5B] font-['Playfair_Display',serif] italic">
{subtitle}
</h3>
<div className="prose prose-lg max-w-none text-[#4A6C6F] font-['Montserrat',sans-serif]">
{description || defaultDescription}
</div>
<div className="mt-10 border-t border-[#9B8357] pt-6">
<p className="text-[#846C5B] italic font-['Montserrat',sans-serif] text-center">
"We don't just serve food; we share our passion for culinary artistry and local flavors."
</p>
</div>
</div>
</section>
);
};
export default AboutSection;