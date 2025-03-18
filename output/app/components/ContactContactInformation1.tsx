import React from 'react';
import { FaPhone, FaEnvelope, FaFacebook, FaInstagram, FaTwitter, FaYelp } from 'react-icons/fa';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
interface ContactInfoProps {
title?: string;
description?: string;
phoneNumber: string;
email: string;
socialLinks: {
facebook?: string;
instagram?: string;
twitter?: string;
yelp?: string;
};
}
const ContactInfo: React.FC<ContactInfoProps> = ({
title = "Contact Us",
description = "Reach out to us or follow us on social media",
phoneNumber,
email,
socialLinks
}) => {
return (
<section className="py-12 px-4 bg-[#F1EDEA]">
<div className="container mx-auto max-w-4xl">
<div className="text-center mb-8">
<h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[#4A6C6F] mb-3">
{title}
</h2>
<p className="font-['Montserrat'] text-[#846C5B] max-w-2xl mx-auto">
{description}
</p>
</div>
<Card className="border-[#C3B299] bg-white/80 backdrop-blur-sm shadow-md">
<CardContent className="p-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div className="space-y-4">
<h3 className="font-['Playfair_Display'] text-xl font-semibold text-[#4A6C6F]">
Direct Contact
</h3>
<div className="flex items-center space-x-3 font-['Montserrat']">
<div className="bg-[#9B8357] p-2 rounded-full text-white">
<FaPhone className="h-5 w-5" />
</div>
<a href={`tel:${phoneNumber}`} className="text-[#846C5B] hover:text-[#4A6C6F] transition-colors">
{phoneNumber}
</a>
</div>
<div className="flex items-center space-x-3 font-['Montserrat']">
<div className="bg-[#9B8357] p-2 rounded-full text-white">
<FaEnvelope className="h-5 w-5" />
</div>
<a href={`mailto:${email}`} className="text-[#846C5B] hover:text-[#4A6C6F] transition-colors">
{email}
</a>
</div>
</div>
<div>
<h3 className="font-['Playfair_Display'] text-xl font-semibold text-[#4A6C6F] mb-4">
Follow Us
</h3>
<div className="flex flex-wrap gap-4">
{socialLinks.facebook && (
<a
href={socialLinks.facebook}
target="_blank"
rel="noopener noreferrer"
className="bg-[#4A6C6F] hover:bg-[#9B8357] transition-colors p-3 rounded-full text-white"
aria-label="Facebook"
>
<FaFacebook className="h-6 w-6" />
</a>
)}
{socialLinks.instagram && (
<a
href={socialLinks.instagram}
target="_blank"
rel="noopener noreferrer"
className="bg-[#4A6C6F] hover:bg-[#9B8357] transition-colors p-3 rounded-full text-white"
aria-label="Instagram"
>
<FaInstagram className="h-6 w-6" />
</a>
)}
{socialLinks.twitter && (
<a
href={socialLinks.twitter}
target="_blank"
rel="noopener noreferrer"
className="bg-[#4A6C6F] hover:bg-[#9B8357] transition-colors p-3 rounded-full text-white"
aria-label="Twitter"
>
<FaTwitter className="h-6 w-6" />
</a>
)}
{socialLinks.yelp && (
<a
href={socialLinks.yelp}
target="_blank"
rel="noopener noreferrer"
className="bg-[#4A6C6F] hover:bg-[#9B8357] transition-colors p-3 rounded-full text-white"
aria-label="Yelp"
>
<FaYelp className="h-6 w-6" />
</a>
)}
</div>
<p className="mt-4 text-sm text-[#846C5B] font-['Montserrat']">
Follow us for updates, promotions, and behind-the-scenes content
</p>
</div>
</div>
<Separator className="my-6 bg-[#C3B299]/30" />
<p className="text-center text-sm text-[#846C5B] font-['Montserrat']">
We look forward to hearing from you and serving you soon!
</p>
</CardContent>
</Card>
</div>
</section>
);
};
export default ContactInfo;