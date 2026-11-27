(() => {
  const mothers = [
    { id: 'm1', name: 'Maya Tamang', phone: '98•••0142', week: 28, risk: 'Routine', followUp: 'Blood pressure review' },
    { id: 'm2', name: 'Anita Shrestha', phone: '98•••6721', week: 34, risk: 'High risk', followUp: 'Check-in after referral' },
    { id: 'm3', name: 'Laxmi Gurung', phone: '98•••3390', week: 19, risk: 'Routine', followUp: 'Iron supplement check' },
    { id: 'm4', name: 'Sushma Rai', phone: '98•••8054', week: 31, risk: 'High risk', followUp: 'Confirm hospital plan' },
    { id: 'm5', name: 'Nirmala Karki', phone: '98•••2276', week: 12, risk: 'Routine', followUp: 'First ANC visit' },
    { id: 'm6', name: 'Sabina BK', phone: '98•••4918', week: 24, risk: 'Routine', followUp: 'Nutrition counseling' },
    { id: 'm7', name: 'Rita Thapa', phone: '98•••1633', week: 36, risk: 'High risk', followUp: 'Urgent blood pressure review' },
    { id: 'm8', name: 'Gita Ale', phone: '98•••5547', week: 8, risk: 'Routine', followUp: 'Confirm next visit' },
  ];

  // Appointment dates are relative to today so the preview stays useful whenever it is opened.
  const appointments = [
    { motherId: 'm1', dayOffset: 2, time: '09:00 AM', type: 'ANC checkup', status: 'upcoming' },
    { motherId: 'm2', dayOffset: 0, time: '09:30 AM', type: 'High-risk review', status: 'upcoming' },
    { motherId: 'm3', dayOffset: 0, time: '10:15 AM', type: 'Nutrition counseling', status: 'upcoming' },
    { motherId: 'm4', dayOffset: -3, time: '11:00 AM', type: 'ANC checkup', status: 'overdue' },
    { motherId: 'm5', dayOffset: 4, time: '11:30 AM', type: 'First ANC visit', status: 'upcoming' },
    { motherId: 'm6', dayOffset: -1, time: '01:00 PM', type: 'ANC checkup', status: 'completed' },
    { motherId: 'm7', dayOffset: 0, time: '02:00 PM', type: 'Blood pressure review', status: 'upcoming' },
    { motherId: 'm8', dayOffset: 6, time: '02:30 PM', type: 'ANC checkup', status: 'upcoming' },
  ];

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const dayDate = (offset) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return date;
  };
  const dateLabel = (date, options = { day: 'numeric', month: 'short' }) => date.toLocaleDateString(undefined, options);
  const todayKey = () => dayDate(0).toDateString();
  const getMother = (id) => mothers.find((mother) => mother.id === id);
  const getStatus = (appointment) => appointment.status === 'completed' ? 'completed' : appointment.dayOffset < 0 ? 'overdue' : 'upcoming';
  const getUpcoming = () => appointments.filter((item) => getStatus(item) === 'upcoming' && item.dayOffset <= 7);
  const getToday = () => appointments.filter((item) => dayDate(item.dayOffset).toDateString() === todayKey());

  function statusPill(status) {
    const labels = { upcoming: 'Upcoming', overdue: 'Overdue', completed: 'Completed' };
    return `<span class="hp-status hp-status--${status}"><i aria-hidden="true"></i>${labels[status]}</span>`;
  }

  function appointmentRows(items, emptyMessage) {
    if (!items.length) return `<div class="hp-empty"><span aria-hidden="true">✓</span><strong>All clear</strong><p>${emptyMessage}</p></div>`;
    return `<div class="hp-table-wrap"><table class="hp-table"><thead><tr><th>Mother</th><th>Date &amp; time</th><th>Appointment type</th><th>Status</th></tr></thead><tbody>${items.map((item) => {
      const mother = getMother(item.motherId);
      return `<tr><td><strong>${escapeHtml(mother.name)}</strong><small>${escapeHtml(mother.phone)}</small></td><td>${dateLabel(dayDate(item.dayOffset))}<small>${escapeHtml(item.time)}</small></td><td>${escapeHtml(item.type)}</td><td>${statusPill(getStatus(item))}</td></tr>`;
    }).join('')}</tbody></table></div>`;
  }

  function motherRows(items, withAppointment = false) {
    if (!items.length) return `<div class="hp-empty"><span aria-hidden="true">✓</span><strong>No mothers to show</strong><p>There are no records in this preview section.</p></div>`;
    return `<div class="hp-table-wrap"><table class="hp-table"><thead><tr><th>Mother</th><th>Contact</th><th>Pregnancy week</th>${withAppointment ? '<th>Next appointment</th><th>Days left</th>' : '<th>Follow-up</th><th>Risk level</th>'}</tr></thead><tbody>${items.map((mother) => {
      const next = appointments.filter((item) => item.motherId === mother.id && getStatus(item) === 'upcoming').sort((a, b) => a.dayOffset - b.dayOffset)[0];
      return `<tr><td><strong>${escapeHtml(mother.name)}</strong></td><td>${escapeHtml(mother.phone)}</td><td>Week ${mother.week}</td>${withAppointment
        ? `<td>${next ? dateLabel(dayDate(next.dayOffset), { weekday: 'short', day: 'numeric', month: 'short' }) : 'Not scheduled'}</td><td>${next ? `<span class="hp-days${next.dayOffset === 0 ? ' hp-days--today' : ''}">${next.dayOffset === 0 ? 'Today' : `${next.dayOffset} days`}</span>` : '—'}</td>`
        : `<td>${escapeHtml(mother.followUp)}</td><td>${mother.risk === 'High risk' ? '<span class="hp-status hp-status--overdue"><i aria-hidden="true"></i>High risk</span>' : '<span class="hp-status hp-status--completed"><i aria-hidden="true"></i>Routine</span>'}</td>`}</tr>`;
    }).join('')}</tbody></table></div>`;
  }

  function statCard(label, value, note, icon, tone) {
    return `<article class="hp-stat hp-stat--${tone}"><span class="hp-stat-icon" aria-hidden="true">${icon}</span><div><p>${label}</p><strong>${value}</strong><small>${note}</small></div></article>`;
  }

  function dashboard() {
    const due = getUpcoming();
    const today = getToday();
    const overdueCount = appointments.filter((item) => getStatus(item) === 'overdue').length;
    const todayAppointments = today.map((item) => ({ ...item, dayOffset: 0 }));
    return `<div class="hp-preview-banner"><span>PREVIEW MODE</span><p>Sample records for demonstration. This dashboard is not connected to real patient data.</p></div>
      <div class="page-heading hp-heading"><div><p class="eyebrow">Health Post Personnel</p><h1>Health Post Dashboard</h1><p>Good morning, Health Worker. Here is the care schedule for your health post.</p></div><span class="hp-date">${dateLabel(dayDate(0), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
      <section class="hp-stats" aria-label="Health post summary statistics">${statCard('Total Registered Mothers', mothers.length, 'in this health post', '♧', 'pink')}${statCard('Mothers Due Soon', due.length, 'appointments in the next 7 days', '◷', 'amber')}${statCard('Overdue Appointments', overdueCount, 'need follow-up', '!', 'red')}${statCard("Today's Appointments", today.length, 'scheduled for today', '✓', 'green')}</section>
      <section class="hp-section panel"><div class="panel-heading"><div><p class="card-kicker">Next 7 days</p><h2>Due Soon Mothers</h2></div><a class="text-action" href="/health-post/due-soon" data-route="/health-post/due-soon">View all <span>→</span></a></div>${motherRows(due.map((appointment) => ({ ...getMother(appointment.motherId), appointment })), true)}</section>
      <section class="hp-section panel"><div class="panel-heading"><div><p class="card-kicker">${dateLabel(dayDate(0), { weekday: 'long' })}</p><h2>Today's Appointments</h2></div><a class="text-action" href="/health-post/appointments" data-route="/health-post/appointments">View schedule <span>→</span></a></div><div class="hp-today-list">${todayAppointments.length ? todayAppointments.map((item) => {
        const mother = getMother(item.motherId);
        return `<article class="hp-today-item"><span class="hp-time">${escapeHtml(item.time)}</span><span class="hp-today-copy"><strong>${escapeHtml(mother.name)}</strong><small>${escapeHtml(item.type)}</small></span>${statusPill(getStatus(item))}</article>`;
      }).join('') : '<div class="hp-empty"><span aria-hidden="true">✓</span><strong>No appointments today</strong><p>Your schedule is clear for today.</p></div>'}</div></section>`;
  }

  function section(view) {
    const pages = {
      mothers: ['All Registered Mothers', 'Every mother registered at this health post.', motherRows(mothers)],
      'due-soon': ['Due Soon Mothers', 'Upcoming appointments scheduled in the next 7 days.', motherRows(getUpcoming().map((item) => ({ ...getMother(item.motherId), appointment: item })), true)],
      appointments: ['Appointments', 'Upcoming, overdue, and completed appointments.', appointmentRows(appointments.slice().sort((a, b) => a.dayOffset - b.dayOffset), 'No appointments are scheduled.')],
      followups: ['Follow-ups', 'Care tasks that need a health worker check-in.', motherRows(mothers.filter((mother) => mother.followUp))],
      'high-risk': ['High-Risk Mothers', 'Mothers flagged for closer follow-up in this preview.', motherRows(mothers.filter((mother) => mother.risk === 'High risk'))],
      reports: ['Reports', 'A quick summary of the current preview dataset.', `<div class="hp-report-grid"><div><span>Registered mothers</span><strong>${mothers.length}</strong></div><div><span>Appointments recorded</span><strong>${appointments.length}</strong></div><div><span>Completed visits</span><strong>${appointments.filter((item) => getStatus(item) === 'completed').length}</strong></div><div><span>High-risk mothers</span><strong>${mothers.filter((mother) => mother.risk === 'High risk').length}</strong></div></div>`],
    };
    const page = pages[view] || pages.mothers;
    return `<div class="hp-preview-banner"><span>PREVIEW MODE</span><p>Sample records for demonstration. This dashboard is not connected to real patient data.</p></div><div class="page-heading hp-heading"><div><p class="eyebrow">Health Post Personnel</p><h1>${page[0]}</h1><p>${page[1]}</p></div></div><section class="hp-section panel">${page[2]}</section>`;
  }

  window.AamaHealthPost = { dashboard, section };
})();
