import React, { useState } from 'react';
import './Calendar.css';

const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Calendar({ onSelect }) {
  const today = new Date();
  const [currMonth, setCurrMonth] = useState(today.getMonth());
  const [currYear, setCurrYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [selectedTime, setSelectedTime] = useState("09");
  const [ampm, setAmpm] = useState("PM");

  const firstDay = new Date(currYear, currMonth, 1).getDay();
  const lastDate = new Date(currYear, currMonth + 1, 0).getDate();
  const prevLastDate = new Date(currYear, currMonth, 0).getDate();

  const handlePrev = () => {
    if (currMonth === 0) {
      setCurrMonth(11);
      setCurrYear(currYear - 1);
    } else {
      setCurrMonth(currMonth - 1);
    }
  };

  const handleNext = () => {
    if (currMonth === 11) {
      setCurrMonth(0);
      setCurrYear(currYear + 1);
    } else {
      setCurrMonth(currMonth + 1);
    }
  };

  const dates = [];
  // Prev month padding
  for (let i = firstDay; i > 0; i--) {
     dates.push({ day: prevLastDate - i + 1, type: 'dim' });
  }
  // Current month
  for (let i = 1; i <= lastDate; i++) {
     dates.push({ day: i, type: 'curr' });
  }
  // Next month padding
  const totalCells = 42;
  const remaining = totalCells - dates.length;
  for (let i = 1; i <= remaining; i++) {
     dates.push({ day: i, type: 'dim' });
  }

  const times1 = ["04", "05", "06", "07", "08", "09", "10"];
  const times2 = ["27", "28", "29", "30", "31", "32", "33"];

  return (
    <div className="cc-cal-root">
      {/* Date Side */}
      <div className="cc-cal-date-side">
        <header className="cc-cal-header">
           <div className="cc-cal-month-select">
             {months[currMonth]} {currYear}
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
           </div>
           <div className="cc-cal-arrows">
             <div className="cc-cal-arrow" onClick={handlePrev}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
             </div>
             <div className="cc-cal-arrow" onClick={handleNext}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
             </div>
           </div>
        </header>

        <div className="cc-cal-days-grid">
          {days.map(d => <div key={d} className="cc-cal-day-label">{d}</div>)}
          {dates.map((d, idx) => (
            <div 
              key={idx} 
              className={`cc-cal-date ${d.type === 'dim' ? 'cc-cal-date-dim' : ''} ${selectedDate === d.day && d.type === 'curr' ? 'cc-cal-date-active' : ''}`}
              onClick={() => d.type === 'curr' && setSelectedDate(d.day)}
            >
              {d.day}
            </div>
          ))}
        </div>

        <footer className="cc-cal-footer">
           <button className="cc-cal-btn" onClick={() => setSelectedDate(0)}>Clear</button>
           <button className="cc-cal-btn" onClick={() => {
             setCurrMonth(today.getMonth());
             setCurrYear(today.getFullYear());
             setSelectedDate(today.getDate());
           }}>Today</button>
        </footer>
      </div>

      {/* Time Side */}
      <div className="cc-cal-time-side">
         <div className="cc-cal-time-bar"></div>
         <div className="cc-cal-time-grid">
            <div className="cc-cal-column">
              {times1.map(t => (
                <div key={t} className="cc-cal-time-item">{t}</div>
              ))}
            </div>
            <div className="cc-cal-column">
              {times2.map(t => (
                <div key={t} className={`cc-cal-time-item ${t === '27' ? 'cc-cal-time-active' : ''}`}>{t}</div>
              ))}
            </div>
            <div className="cc-cal-ampm">
               <button className="cc-cal-ampm-btn cc-cal-ampm-active">PM</button>
               <button className="cc-cal-ampm-btn">AM</button>
            </div>
         </div>
         <button 
           className="fd-btn-primary" 
           style={{marginTop: 'auto', padding: '10px', borderRadius: '4px'}}
           onClick={() => onSelect && onSelect(`${currYear}-${currMonth+1}-${selectedDate} 27:00 PM`)}
         >
           Set Event
         </button>
      </div>
    </div>
  );
}
