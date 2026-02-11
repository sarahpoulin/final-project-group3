import Story from './story';
import WhatWeDo from './what-we-do';

export default function About() {
  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">About</h1>
        <p className="text-lg text-gray-600 mb-8">Learn about Shoreline Woodworks — our craft, materials, and services.</p>
        <Story />
        <WhatWeDo />
        <div className="mt-8">
          <a href="/contact" className="inline-block bg-amber-600 text-white px-5 py-3 rounded-md shadow hover:bg-amber-700">Request a Quote</a>
        </div>
      </div>
    </div>
  );
}