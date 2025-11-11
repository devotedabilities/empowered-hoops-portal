function Resources() {
  const resources = [
    {
      category: 'Training Manuals',
      items: [
        {
          title: 'Empowered Hoops Behavior Management Manual',
          description: 'Complete guide to behavior management approaches',
          type: 'PDF',
          link: '#', // Add your actual Google Drive link here
        },
        {
          title: 'Session Planning Guide',
          description: 'How to plan and structure effective sessions',
          type: 'PDF',
          link: '#',
        },
      ],
    },
    {
      category: 'NDIS & Compliance',
      items: [
        {
          title: 'NDIS Service Agreement Template',
          description: 'Standard service agreement template',
          type: 'DOC',
          link: '#',
        },
        {
          title: 'Incident Reporting Procedures',
          description: 'How to report and document incidents',
          type: 'PDF',
          link: '#',
        },
      ],
    },
    {
      category: 'Program Resources',
      items: [
        {
          title: 'Learning Criteria Framework',
          description: 'Social skills mapping and assessment criteria',
          type: 'PDF',
          link: '#',
        },
        {
          title: 'Drill Library',
          description: 'Basketball drills and activity ideas',
          type: 'PDF',
          link: '#',
        },
      ],
    },
  ];

  return (
    <div className="resources-page">
      <div className="page-header">
        <h1>📚 Resources</h1>
        <p>Training materials, manuals, and documentation</p>
      </div>

      {resources.map((section, idx) => (
        <div key={idx} className="resource-section">
          <h2>{section.category}</h2>
          <div className="resource-grid">
            {section.items.map((item, itemIdx) => (
              <a
                key={itemIdx}
                href={item.link}
                className="resource-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="resource-type-badge">{item.type}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="resource-link">View Document →</span>
              </a>
            ))}
          </div>
        </div>
      ))}

      <div className="resources-footer">
        <div className="info-box">
          <h3>Can't find what you need?</h3>
          <p>
            Contact <a href="mailto:info@devotedabilities.com">info@devotedabilities.com</a> to
            request additional resources or documentation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Resources;
