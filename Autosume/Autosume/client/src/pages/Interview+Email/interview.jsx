import React, { useState } from 'react';

const candidates = [
  {
    name: 'Audrey Hall',
    role: 'Solution Arch',
    match: 92,
    status: 'Scheduled',
  },
  {
    name: 'Samanta Wong',
    role: 'UI/UX Designer',
    match: 87,
    status: 'Pending',
    email: 'wongsamanta_23@gmail.com',
    phone: '+65 8012 3040',
    skills: ['Figma', 'UI/UX', 'Prototyping', 'Thinking', 'Design'],
    experience: '3+ years',
    summary:
      'Samanta Wong brings over three years of experience in crafting intuitive and visually engaging user interfaces. Her portfolio demonstrates a strong command of design tools like Figma and a clear understanding of user-centered design principles. Her background in prototyping, wireframing, and usability testing aligns well with the requirements of the UI/UX Designer role. With a high match score of 87%, her skill set in design thinking, coupled with effective communication and cross-functional collaboration, positions her as a standout candidate. Samanta’s ability to translate complex requirements into elegant interfaces makes her a strong asset for fast-paced, product-driven teams.',
  },
  {
    name: 'Jason Lim',
    role: 'Data Scientist',
    match: 86,
    status: 'Not Scheduled',
  },
];

export default function ShortlistOverview() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex min-h-screen bg-white text-black">
      {/* Sidebar */}
      <aside className="w-56 bg-black text-white p-4 space-y-4">
        <h2 className="text-2xl font-bold mb-6">AUTOSUME</h2>
        <nav className="space-y-2">
          <div>Dashboard</div>
          <div>Job Management</div>
          <div>Resume Shortlisting</div>
          <div className="bg-gray-700 rounded px-2 py-1">Interview Scheduling</div>
          <div>Settings</div>
          <div>Support</div>
        </nav>
        <button className="mt-10 border rounded px-4 py-2">Log Out</button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-semibold mb-6">Shortlist Overview</h1>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <select className="border p-2 rounded">
            <option>Software Engineer</option>
          </select>
          <select className="border p-2 rounded">
            <option>Any</option>
          </select>
          <select className="border p-2 rounded">
            <option>&gt;70%</option>
          </select>
        </div>

        <div className="flex gap-8">
          {/* Candidate List */}
          <div className="w-1/3 space-y-2">
            {candidates.map((c, i) => (
              <div
                key={i}
                onClick={() => setSelected(c)}
                className={`p-2 rounded cursor-pointer border ${selected?.name === c.name ? 'bg-gray-300' : 'bg-gray-100'}`}
              >
                <div className="font-semibold">{c.name}</div>
                <div className="text-sm text-gray-600">{c.role}</div>
                <div className="text-sm">{c.match}%</div>
              </div>
            ))}
          </div>

          {/* Candidate Details */}
          {selected && (
            <div className="w-2/3 border rounded p-4 shadow-sm">
              <h2 className="text-xl font-bold mb-2">{selected.name}</h2>
              <p className="text-sm text-gray-600 mb-1">{selected.role}</p>
              <p className="text-sm">{selected.email}</p>
              <p className="text-sm mb-3">{selected.phone}</p>
              <div className="mb-2">
                <strong>Skills:</strong>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {selected.skills?.map((s, i) => (
                    <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mb-2">
                <strong>Experience:</strong> {selected.experience}
              </p>
              <div className="mb-4">
                <strong>AI Summary:</strong>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selected.summary}</p>
              </div>
              <button className="bg-blue-500 text-white px-4 py-2 rounded">
                Proceed to Schedule
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}