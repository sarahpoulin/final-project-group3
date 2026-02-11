export default function WhatWeDo() {
  return (
    <section aria-labelledby="what-we-do" className="bg-gray-50 p-6 rounded-lg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 id="what-we-do" className="text-2xl font-semibold mb-6">What We Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-5 bg-white rounded shadow">
            <h3 className="font-medium mb-2">Custom Stairs & Railings</h3>
            <p className="text-sm text-gray-600">Hand-crafted staircases and railings designed to complement any home aesthetic.</p>
          </div>

          <div className="p-5 bg-white rounded shadow">
            <h3 className="font-medium mb-2">Millwork & Cabinetry</h3>
            <p className="text-sm text-gray-600">Built-in cabinets, shelving, and architectural millwork tailored to your vision.</p>
          </div>

          <div className="p-5 bg-white rounded shadow">
            <h3 className="font-medium mb-2">Flooring Installation</h3>
            <p className="text-sm text-gray-600">Premium hardwood flooring selection and expert installation.</p>
          </div>

          <div className="p-5 bg-white rounded shadow">
            <h3 className="font-medium mb-2">Home Renovations</h3>
            <p className="text-sm text-gray-600">Full renovation projects with woodworking and custom details.</p>
          </div>

          <div className="p-5 bg-white rounded shadow">
            <h3 className="font-medium mb-2">Restoration & Repair</h3>
            <p className="text-sm text-gray-600">Expert restoration and repair of existing woodwork and furniture.</p>
          </div>

          <div className="p-5 bg-white rounded shadow">
            <h3 className="font-medium mb-2">Design Consultation</h3>
            <p className="text-sm text-gray-600">Personalized consultations to bring your woodworking vision to life.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
