const PanelContent = ({ active }) => {
  switch (active) {
    case 'Attendance':
      return <div>📅 Attendance details here...</div>;
    case 'Routine':
      return <div>🕒 Class routine content...</div>;
    case 'Assignments':
      return <div>📝 Assignment list goes here...</div>;
    default:
      return <div>🔍 Select a section</div>;
  }
};

export default PanelContent;
