// src/pages/ShortlistOverview.jsx
import React from 'react';

const candidates = [
  {
    name: 'Audrey Hall', role: 'Solution Arch', match: 92, status: 'Scheduled',
    email: 'audrey.hall@example.com', phone: '+65 8123 4567',
    skills: ['Architecture', 'Design', 'Leadership'], experience: '5+ years',
    summary: 'Audrey has over five years of experience architecting solutions...'
  },
  {
    name: 'Dunn Smith', role: 'Financial Analyst', match: 84, status: 'Scheduled',
    email: 'dunn.smith@example.com', phone: '+65 8123 4568',
    skills: ['Excel', 'Modelling', 'Analytics'], experience: '4+ years',
    summary: 'Dunn specializes in financial modelling and reporting...'
  },
  {
    name: 'Samanta Wong', role: 'UI/UX Designer', match: 87, status: 'Pending',
    email: 'wongsamanta_23@gmail.com', phone: '+65 8012 3040',
    skills: ['Figma', 'UI/UX', 'Prototyping', 'Thinking', 'Design'], experience: '3+ years',
    summary: 'Samanta brings over three years of experience in crafting intuitive and visually engaging user interfaces...'
  }
];

export default function ShortlistOverview() {
  const [selectedCandidate, setSelectedCandidate] = useState(candidates[2]);
  const [filters, setFilters] = useState({ role: '', status: '', match: '' });

  const filtered = candidates.filter(c => {
    const matchFilter = filters.match === '>70%' ? c.match > 70 : true;
    const roleFilter = filters.role ? c.role === filters.role : true;
    const statusFilter = filters.status ? c.status === filters.status : true;
    return matchFilter && roleFilter && statusFilter;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-4 rounded shadow-md flex gap-6">

        {/* Left: Filters and List */}
        <div className="w-1/3">
          <h2 className="text-lg font-semibold mb-2">Shortlist Overview</h2>

          <div className="flex flex-col gap-2 mb-4">
            <select className="border p-2 rounded" onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
              <option value="">Select Role</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="Solution Arch">Solution Arch</option>
            </select>
            <select className="border p-2 rounded" onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Any Status</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
            </select>
            <select className="border p-2 rounded" onChange={(e) => setFilters({ ...filters, match: e.target.value })}>
              <option value="">Match %</option>
              <option value=">70%">{'>70%'}</option>
            </select>
          </div>

          <ul className="border rounded divide-y">
            {filtered.map((c, idx) => (
              <li
                key={idx}
                className={`p-3 cursor-pointer hover:bg-gray-100 ${c.name === selectedCandidate.name ? 'bg-gray-100' : ''}`}
                onClick={() => setSelectedCandidate(c)}
              >
                <div className="flex justify-between">
                  <span>{c.name}</span>
                  <span className="text-sm font-medium">{c.match}%</span>
                </div>
                <div className="text-xs text-gray-500">{c.role} - {c.status}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Details Panel */}
        <div className="w-2/3 bg-gray-50 p-4 rounded">
          {selectedCandidate && (
            <div>
              <h3 className="text-xl font-semibold mb-1">{selectedCandidate.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{selectedCandidate.role}</p>
              <p className="text-sm text-gray-600">📧 {selectedCandidate.email}</p>
              <p className="text-sm text-gray-600 mb-4">📞 {selectedCandidate.phone}</p>

              <div className="mb-2">
                <strong>Skills:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedCandidate.skills.map((s, i) => (
                    <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm">{s}</span>
                  ))}
                </div>
              </div>

              <div className="mb-2">
                <strong>Experience:</strong>
                <p>{selectedCandidate.experience}</p>
              </div>

              <div className="mb-4">
                <strong>AI Summary:</strong>
                <p className="text-sm mt-1 text-gray-700">
                  {selectedCandidate.summary}
                </p>
              </div>

              <button className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
                Proceed to Schedule
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
