import React, { useState } from 'react';

const candidates = [
  {
    name: 'Samanta Wong',
    role: 'UI/UX Designer',
    email: 'wongsamanta_23@gmail.com',
    phone: '+65 8012 3040',
    match: 87,
    skills: ['Figma', 'UI/UX', 'Prototyping', 'Thinking', 'Design'],
    experience: '3+ years',
    aiSummary:
      'Samanta Wong brings over three years of experience in crafting intuitive and visually engaging user interfaces. Her portfolio demonstrates a strong command of design tools like Figma and a clear understanding of user-centered design principles. Her background in prototyping, wireframing, and usability testing aligns well with the requirements of the UI/UX Designer role.',
  },
  // Add more candidates here...
];

const ShortlistOverview = () => {
  const [selected, setSelected] = useState(candidates[0]);

  return (
    <div className="flex p-6 gap-6">
      {/* Sidebar */}
      <div className="w-1/3 border rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Candidates</h2>
        {candidates.map((candidate, idx) => (
          <div
            key={idx}
            className={`p-2 rounded cursor-pointer ${
              candidate.name === selected.name ? 'bg-gray-200' : ''
            }`}
            onClick={() => setSelected(candidate)}
          >
            <div className="font-semibold">{candidate.name}</div>
            <div className="text-sm text-gray-500">{candidate.role}</div>
            <div className="text-sm text-green-600 font-bold">
              {candidate.match}%
            </div>
          </div>
        ))}
      </div>

      {/* Candidate Details */}
      <div className="w-2/3 border rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-2">{selected.name}</h2>
        <p className="text-gray-600">{selected.role}</p>
        <p className="mt-2">📧 {selected.email}</p>
        <p>📞 {selected.phone}</p>

        <div className="mt-4">
          <h3 className="font-semibold">Skills:</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {selected.skills.map((skill, i) => (
              <span
                key={i}
                className="bg-gray-100 text-sm px-3 py-1 rounded-full border"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Experience:</h3>
          <p>{selected.experience}</p>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">AI Summary:</h3>
          <p className="text-sm text-gray-700">{selected.aiSummary}</p>
        </div>

        <button className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Proceed to Schedule
        </button>
      </div>
    </div>
  );
};

export default ShortlistOverview;
