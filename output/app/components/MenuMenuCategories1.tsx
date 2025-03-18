import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
Accordion,
AccordionContent,
AccordionItem,
AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
interface MenuItem {
id: string;
name: string;
description: string;
price: string;
}
interface MenuCategory {
id: string;
title: string;
items: MenuItem[];
}
interface MenuSectionProps {
title: string;
description?: string;
categories: MenuCategory[];
}
const MenuSection: React.FC<MenuSectionProps> = ({
title,
description,
categories,
}) => {
const [activeTab, setActiveTab] = useState(categories[0]?.id || "");
const isMobile = useMediaQuery("(max-width: 768px)");
const renderMenuItem = (item: MenuItem) => (
<div key={item.id} className="mb-6 group">
<div className="flex justify-between items-baseline mb-1">
<h4 className="font-serif text-lg font-semibold text-primary group-hover:text-accent transition-colors">
{item.name}
</h4>
<span className="text-accent font-medium ml-2 tabular-nums">
{item.price}
</span>
</div>
<p className="text-text text-sm leading-relaxed">{item.description}</p>
</div>
);
return (
<section className="py-16 px-4 bg-background">
<div className="max-w-6xl mx-auto">
<h2 className="font-serif text-4xl md:text-5xl text-primary mb-3 text-center font-bold">
{title}
</h2>
{description && (
<p className="text-text text-center max-w-2xl mx-auto mb-10">
{description}
</p>
)}
{isMobile ? (
<Accordion
type="single"
collapsible
className="w-full"
defaultValue={categories[0]?.id}
>
{categories.map((category) => (
<AccordionItem key={category.id} value={category.id}>
<AccordionTrigger className="font-serif text-xl text-secondary hover:text-accent">
{category.title}
</AccordionTrigger>
<AccordionContent>
<div className="pt-4 pb-2 px-1">
{category.items.map(renderMenuItem)}
</div>
</AccordionContent>
</AccordionItem>
))}
</Accordion>
) : (
<Tabs
defaultValue={categories[0]?.id}
value={activeTab}
onValueChange={setActiveTab}
className="w-full"
>
<TabsList className="mb-8 w-full flex justify-center bg-transparent border-b border-text/20">
{categories.map((category) => (
<TabsTrigger
key={category.id}
value={category.id}
className={cn(
"font-serif text-lg py-3 px-6 data-[state=active]:text-accent data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:shadow-none rounded-none bg-transparent",
"text-secondary hover:text-primary transition-colors"
)}
>
{category.title}
</TabsTrigger>
))}
</TabsList>
{categories.map((category) => (
<TabsContent
key={category.id}
value={category.id}
className="mt-0 grid md:grid-cols-2 gap-x-12 gap-y-2"
>
{category.items.map(renderMenuItem)}
</TabsContent>
))}
</Tabs>
)}
</div>
</section>
);
};
export default MenuSection;
// Example usage:
export const MenuSectionExample: React.FC = () => {
const menuData: MenuCategory[] = [
{
id: "appetizers",
title: "Appetizers",
items: [
{
id: "app1",
name: "Bruschetta",
description: "Toasted bread topped with fresh tomatoes, basil, and garlic",
price: "$8.95"
},
{
id: "app2",
name: "Calamari Fritti",
description: "Crispy fried calamari served with lemon aioli",
price: "$12.95"
},
{
id: "app3",
name: "Caprese Salad",
description: "Fresh mozzarella, tomatoes, and basil drizzled with balsamic glaze",
price: "$10.95"
},
]
},
{
id: "main-courses",
title: "Main Courses",
items: [
{
id: "main1",
name: "Grilled Salmon",
description: "Atlantic salmon with lemon butter sauce and seasonal vegetables",
price: "$24.95"
},
{
id: "main2",
name: "Filet Mignon",
description: "8oz tenderloin with red wine reduction and truffle mashed potatoes",
price: "$32.95"
},
{
id: "main3",
name: "Mushroom Risotto",
description: "Creamy arborio rice with wild mushrooms and parmesan",
price: "$18.95"
},
]
},
{
id: "desserts",
title: "Desserts",
items: [
{
id: "dessert1",
name: "Tiramisu",
description: "Classic Italian dessert with espresso-soaked ladyfingers",
price: "$8.95"
},
{
id: "dessert2",
name: "Chocolate Lava Cake",
description: "Warm chocolate cake with a molten center and vanilla ice cream",
price: "$9.95"
},
]
},
{
id: "drinks",
title: "Drinks",
items: [
{
id: "drink1",
name: "Signature Cocktails",
description: "Ask your server about our seasonal specialty cocktails",
price: "$12.95"
},
{
id: "drink2",
name: "Wine Selection",
description: "Extensive wine list featuring local and international varieties",
price: "Varies"
},
]
}
];
return (
<MenuSection
title="Our Menu"
description="Crafted with the finest ingredients, our menu offers a perfect blend of traditional favorites and innovative culinary creations."
categories={menuData}
/>
);
};