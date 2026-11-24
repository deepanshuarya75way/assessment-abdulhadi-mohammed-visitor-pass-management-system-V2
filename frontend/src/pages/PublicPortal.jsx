import React, { useState } from "react";
import { Link } from "react-router-dom";
import VisitorForm from "../components/VisitorForm";
import AppointmentForm from "../components/AppointmentForm";
import DateTimePicker, { buildISOFromParts } from "../components/DateTimePicker"
import {BASE_URL} from "../config" 

const PublicPortal = () => {
  const [activeVisitor, setActiveVisitor] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    purpose: "",
    hostName: "",
    startTime: "",
    photo: null,
  });

  const [appointmentDetails, setAppointmentDetails] = useState({
    startTime: "",
    date: "",
    hostName: "",
  });


  // rescheduling form

  const[rescheduleDate, setRescheduleDate] = useState("")
  const[rescheduleHour, setRescheduleHour] = useState("09")
  const[rescheduleMinute, setRescheduleMinute] = useState("00")
  const[reschedulePeriod, setReschedulePeriod] = useState("AM")
  const[error, setError] = useState("")
  const[success, setSuccess] = useState("")
  const[rescheduleEmail, setRescheduleEmail] = useState("") 
  const[showReschedule, setShowReschedule] = useState("") 
  const[isSaving, setIsSaving] = useState(false)

  const handleReschedule = async(e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    const cleanEmail = rescheduleEmail.trim().toLowerCase()
    if(!cleanEmail|| ! rescheduleDate){
      setError("Please enter email and new time")
      return
    }

    const newDateTimeISO = buildISOFromParts(
    rescheduleDate,
    rescheduleHour,
    rescheduleMinute,
    reschedulePeriod
    );

    setIsSaving(true)
    try{
      const lookResponse = await fetch(`${BASE_URL}/api/appointments/visitor?email=${encodeURIComponent(cleanEmail)}`)
      
      const appointments = await lookResponse.json()
      
      if(!lookResponse.ok){
        throw new Error("No visitor found")
      }

      const pendingAppointment = appointments.find((a)=>a.status === "Pending")
      
      if(!pendingAppointment){
        throw new Error("No pending appointments")
      }
      
      //rescheduling
      const patchRes = await fetch(`${BASE_URL}/api/appointments/${pendingAppointment._id}/reschedule`,
        {method: "PATCH", 
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            email: cleanEmail,
            dateTime: newDateTimeISO
          })
        })
      const updated = await patchRes.json()

      if(!patchRes.ok){
        throw new Error("Failed to reschedule")
      }
      setSuccess(
        `Appointment rescheduled to ${new Date(updated.dateTime).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })}!`
      )
      setRescheduleEmail("");
      setRescheduleDate("");
      setRescheduleHour("09");
      setRescheduleMinute("00");
      setReschedulePeriod("AM");
    } catch (err) {
      setError(err.message || "Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-slate-100 to-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Visitor Pass Registration
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-xl mx-auto">
            {submittedData
              ? "Your visitor pass request has been successfully submitted."
              : activeVisitor
              ? "Select your preferred date and time for your visit."
              : "Please enter your details below. Once registered, you will select your visit date and time."}
          </p>

          {/* Stepper Indicator */}
          {!submittedData && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  !activeVisitor
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                1. Visitor Details {!activeVisitor ? "(Active)" : "✓"}
              </span>
              <span className="text-slate-300 font-bold">→</span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  activeVisitor
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                2. Date & Time {activeVisitor ? "(Active)" : ""}
              </span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 max-w-xl mx-auto">
          {!activeVisitor && !submittedData && (
            <VisitorForm
              onSuccess={(data) => {
                setActiveVisitor(data);
              }}
              formData={formData}
              setFormData={setFormData}
              appointmentDetails={appointmentDetails}
              setAppointmentDetails={setAppointmentDetails}
            />
          )}

          {activeVisitor && !submittedData && (
            <div>
              <div className="mb-4 pb-3 border-b border-gray-100">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Visitor: {activeVisitor.name}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  Host: <strong className="text-gray-800">{activeVisitor.hostName || "Security Desk"}</strong> | Purpose:{" "}
                  <strong className="text-gray-800">{activeVisitor.purpose || "Official Visit"}</strong>
                </p>
              </div>

              <AppointmentForm
                visitorId={activeVisitor._id || activeVisitor.id}
                formData={formData}
                appointmentDetails={appointmentDetails}
                onComplete={(apptData) => {
                  setSubmittedData({
                    ...activeVisitor,
                    ...apptData,
                    dateTime: apptData?.dateTime || new Date().toISOString(),
                  });
                  setActiveVisitor(null);
                }}
              />

              <button
                type="button"
                onClick={() => setActiveVisitor(null)}
                className="w-full mt-2 text-center text-xs text-slate-500 hover:text-slate-700 py-1.5 transition-colors cursor-pointer"
              >
                ← Back to edit visitor details
              </button>
            </div>
          )}

          {/* STEP 3: Submission Confirmation Summary */}
          {submittedData && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-inner">
                ✓
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Pass Request Submitted!
              </h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Thank you, <strong className="text-slate-900">{submittedData?.name}</strong>. Your pass request has been forwarded to host and the front desk for approval.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6 space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Visitor Name:</span>
                  <span className="text-slate-800 font-semibold">{submittedData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Email Address:</span>
                  <span className="text-slate-800 font-semibold">{submittedData?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Host to Meet:</span>
                  <span className="text-slate-800 font-semibold">
                    {submittedData?.hostName || "Security Desk"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Purpose:</span>
                  <span className="text-slate-800 font-semibold">
                    {submittedData?.purpose || "Official Visit"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200/80 pt-2">
                  <span className="text-blue-700 font-semibold">Scheduled Date & Time:</span>
                  <span className="text-blue-900 font-bold">
                    {new Date(submittedData?.dateTime || Date.now()).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                    Pending Approval
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-6">
                Upon approval PDF pass and QR code badge will be emailed.
              </p>

              <button
                onClick={() => {
                  setSubmittedData(null);
                  setActiveVisitor(null);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Register Another Visitor
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          Staff member or Security guard?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Log in to Security Dashboard
          </Link>
        </div>
         

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 max-w-xl mt-6 mx-auto">
          <form onSubmit={handleReschedule}>
            <div className="pb-3 border-b border-gray-100">
              <h3 className="text-xl font-bold tracking-tight text-gray-900">
                Reschedule an appointment?
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Enter details to reschedule
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mt-2 mb-2">
                Email
              </label>
              <input
                type="email"
                value={rescheduleEmail}
                onChange={(e) => setRescheduleEmail(e.target.value)}
                placeholder="Enter email"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all mb-4"
              />
            </div>

            <DateTimePicker
              date={rescheduleDate}
              setDate={setRescheduleDate}
              hour={rescheduleHour}
              setHour={setRescheduleHour}
              minute={rescheduleMinute}
              setMinute={setRescheduleMinute}
              period={reschedulePeriod}
              setPeriod={setReschedulePeriod}
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg m-4">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-lg m-4">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium text-sm py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {isSaving ? "Rescheduling..." : "Reschedule Appointment"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default PublicPortal;
