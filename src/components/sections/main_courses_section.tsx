import React from 'react';
import Image from 'next/image';

interface MainCourseItem {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

interface MainCourseSectionProps {
  mainCourses: MainCourseItem[];
  layout: 'grid' | 'list';
}

const MainCourseSection: React.FC<MainCourseSectionProps> = ({ mainCourses, layout }) => {
  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Main Courses</h2>
        <div className={`grid ${layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : ''}`}>
          {mainCourses.map((course) => (
            <div
              key={course.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden ${layout === 'list' ? 'flex' : ''}`}
            >
              <div className={`${layout === 'list' ? 'flex-shrink-0' : ''}`}>
                <Image
                  src={course.imageUrl}
                  alt={course.name}
                  width={layout === 'grid' ? 400 : 200}
                  height={layout === 'grid' ? 300 : 150}
                  className="object-cover"
                />
              </div>
              <div className={`p-6 ${layout === 'list' ? 'flex-grow' : ''}`}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.name}</h3>
                <p className="text-gray-700 mb-4">{course.description}</p>
                <p className="text-lg font-bold text-gray-900">${course.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainCourseSection;