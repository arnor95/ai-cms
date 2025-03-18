import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
interface HoursOfOperationProps {
title?: string;
description?: string;
hours?: {
day: string;
openTime: string;
closeTime: string;
isClosed?: boolean;
}[];
}
const defaultHours = [
{ day: 'Monday', openTime: '11:00 AM', closeTime: '9:00 PM' },
{ day: 'Tuesday', openTime: '11:00 AM', closeTime: '9:00 PM' },
{ day: 'Wednesday', openTime: '11:00 AM', closeTime: '9:00 PM' },
{ day: 'Thursday', openTime: '11:00 AM', closeTime: '10:00 PM' },
{ day: 'Friday', openTime: '11:00 AM', closeTime: '11:00 PM' },
{ day: 'Saturday', openTime: '10:00 AM', closeTime: '11:00 PM' },
{ day: 'Sunday', openTime: '10:00 AM', closeTime: '8:00 PM' },
];
const HoursOfOperation: React.FC<HoursOfOperationProps> = ({
title = 'Hours of Operation',
description = 'Visit us during these hours for a delightful dining experience.',
hours = defaultHours,
}) => {
return (
<section className="py-12 bg-[#F1EDEA]">
<div className="container mx-auto px-4">
<div className="text-center mb-8">
<h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#4A6C6F] font-['Playfair_Display',serif]">
{title}
</h2>
<p className="text-[#846C5B] max-w-2xl mx-auto font-['Montserrat',sans-serif]">
{description}
</p>
</div>
<Card className="max-w-2xl mx-auto border-[#9B8357] border shadow-md">
<CardHeader className="bg-[#4A6C6F] text-white">
<CardTitle className="text-xl font-['Playfair_Display',serif] text-center">
Our Schedule
</CardTitle>
<CardDescription className="text-[#C3B299] text-center font-['Montserrat',sans-serif]">
We look forward to serving you
</CardDescription>
</CardHeader>
<CardContent className="p-0">
<Table>
<TableHeader>
<TableRow className="bg-[#9B8357]/10">
<TableHead className="font-['Montserrat',sans-serif] text-[#4A6C6F] font-bold">Day</TableHead>
<TableHead className="font-['Montserrat',sans-serif] text-[#4A6C6F] font-bold text-right">Hours</TableHead>
</TableRow>
</TableHeader>
<TableBody>
{hours.map((item, index) => (
<TableRow key={index} className="border-b border-[#C3B299]/20">
<TableCell className="font-['Montserrat',sans-serif] font-medium text-[#846C5B]">
{item.day}
</TableCell>
<TableCell className="font-['Montserrat',sans-serif] text-[#846C5B] text-right">
{item.isClosed ? (
<span className="text-[#9B8357]">Closed</span>
) : (
`${item.openTime} - ${item.closeTime}`
)}
</TableCell>
</TableRow>
))}
</TableBody>
</Table>
</CardContent>
</Card>
<div className="mt-8 text-center">
<p className="text-sm text-[#846C5B] italic font-['Montserrat',sans-serif]">
* Kitchen closes 30 minutes before closing time
</p>
<p className="text-sm text-[#846C5B] font-['Montserrat',sans-serif] mt-2">
Holiday hours may vary. Please call ahead for confirmation.
</p>
</div>
</div>
</section>
);
};
export default HoursOfOperation;