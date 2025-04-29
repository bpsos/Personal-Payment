// File: src/App.jsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const today = new Date();

function getMonthDays(year, month) {
  const date = new Date(year, month, 1);
  const days = [];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const adjustedIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

  for (let i = 0; i < adjustedIndex; i++) {
    days.push(null);
  }

  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function monthNames(monthIndex) {
  return ["January", "February", "March", "April", "May", "June", "July", 
          "August", "September", "October", "November", "December"][monthIndex];
}

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [salaries, setSalaries] = useState([]);
  const [spendings, setSpendings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [inputDate, setInputDate] = useState(null);
  const [entryType, setEntryType] = useState("salary");
  const [inputData, setInputData] = useState({ card: "", description: "", recurring: false });

  useEffect(() => {
    const savedSalaries = JSON.parse(localStorage.getItem("salaries")) || [];
    const savedSpendings = JSON.parse(localStorage.getItem("spendings")) || [];
    setSalaries(savedSalaries);
    setSpendings(savedSpendings);
  }, []);

  useEffect(() => {
    localStorage.setItem("salaries", JSON.stringify(salaries));
    localStorage.setItem("spendings", JSON.stringify(spendings));
  }, [salaries, spendings]);

  const days = getMonthDays(currentYear, currentMonth);

  const handleDayClick = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSubmit = () => {
    if (!inputDate) return;
    const newEntry = {
      date: inputDate.toISOString().split('T')[0],
      ...inputData,
    };

    if (entryType === "salary") {
      setSalaries([...salaries, newEntry]);
    } else {
      setSpendings([...spendings, newEntry]);
    }

    if (inputData.recurring) {
      for (let i = 1; i <= 12; i++) {
        const futureDate = new Date(inputDate);
        futureDate.setMonth(futureDate.getMonth() + i);
        const recurringEntry = {
          ...newEntry,
          date: futureDate.toISOString().split('T')[0],
        };
        if (entryType === "salary") {
          setSalaries((prev) => [...prev, recurringEntry]);
        } else {
          setSpendings((prev) => [...prev, recurringEntry]);
        }
      }
    }

    setInputData({ card: "", description: "", recurring: false });
    setInputDate(null);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) setCurrentYear((prev) => prev - 1);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) setCurrentYear((prev) => prev + 1);
  };

  const getDayColor = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const hasSalary = salaries.some(s => s.date === dateString);
    const hasSpending = spendings.some(s => s.date === dateString);

    if (hasSalary && hasSpending) return "bg-purple-300";
    if (hasSalary) return "bg-green-300";
    if (hasSpending) return "bg-blue-300";
    return "bg-red-200";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Salary & Spending Calendar</h1>

      <div className="flex justify-between items-center mb-4">
        <Button onClick={handlePrevMonth}>&larr; Prev</Button>
        <h2 className="text-xl font-semibold">{monthNames(currentMonth)} {currentYear}</h2>
        <Button onClick={handleNextMonth}>Next &rarr;</Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 text-center font-semibold">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, idx) => (
          <div key={idx}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mb-8">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`border rounded-lg min-h-[60px] p-2 text-center cursor-pointer 
            ${day ? getDayColor(day) : "bg-gray-100 cursor-default"}`}
            onClick={() => handleDayClick(day)}
          >
            {day ? day.getDate() : ""}
          </div>
        ))}
      </div>

      {inputDate && (
        <div className="mb-6">
          <h2 className="text-xl mb-2">Add Entry for {inputDate.toDateString()}</h2>
          <div className="flex flex-col gap-2">
            <select value={entryType} onChange={(e) => setEntryType(e.target.value)} className="border p-2 rounded">
              <option value="salary">Salary</option>
              <option value="spending">Spending</option>
            </select>
            <input
              type="text"
              placeholder="Card"
              value={inputData.card}
              onChange={(e) => setInputData({ ...inputData, card: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Description"
              value={inputData.description}
              onChange={(e) => setInputData({ ...inputData, description: e.target.value })}
              className="border p-2 rounded"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={inputData.recurring}
                onChange={(e) => setInputData({ ...inputData, recurring: e.target.checked })}
              />
              Recurring Monthly
            </label>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md relative">
            <h2 className="text-xl font-bold mb-4 text-center">Entries for {selectedDate.toDateString()}</h2>
            <Button
              className="absolute top-2 right-2"
              onClick={() => setSelectedDate(null)}
            >X</Button>

            <h3 className="text-lg font-semibold mt-2">Salaries</h3>
            <ul className="list-disc ml-4">
              {salaries.filter(s => s.date === selectedDate.toISOString().split('T')[0]).map((s, idx) => (
                <li key={idx}>{s.card} - {s.description}</li>
              ))}
              {salaries.filter(s => s.date === selectedDate.toISOString().split('T')[0]).length === 0 && (
                <li className="text-red-400">No salaries</li>
              )}
            </ul>

            <h3 className="text-lg font-semibold mt-4">Spendings</h3>
            <ul className="list-disc ml-4">
              {spendings.filter(s => s.date === selectedDate.toISOString().split('T')[0]).map((s, idx) => (
                <li key={idx}>{s.card} - {s.description}</li>
              ))}
              {spendings.filter(s => s.date === selectedDate.toISOString().split('T')[0]).length === 0 && (
                <li className="text-red-400">No spendings</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
