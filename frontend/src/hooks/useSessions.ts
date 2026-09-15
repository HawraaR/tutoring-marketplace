import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createConversation } from "../api/messageAPI";
import {
  formatSessionDates,
  type SessionTab,
} from "../lib/utils/sessionHelpers";
import type {
  Booking,
  UnifiedSession,
  SessionStatus,
  UpdateBookingStatusPayload,
} from "../types";

export function useSessions() {
  const { user, activeRole } = useAuth();
  const userId = user?.id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isTutorMode = activeRole === "tutor";

  const [sessions, setSessions] = useState<UnifiedSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<SessionTab>(() => {
    const scope = searchParams.get("scope");
    return scope === "past" || scope === "cancelled" ? scope : "upcoming";
  });
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  // Track active role shifts without triggering synchronous re-renders in effects
  const prevRoleRef = useRef(activeRole);

  const fetchSessions = useCallback(async () => {
    try {
      const endpoint = isTutorMode ? "/bookings/tutor" : "/bookings/user";
      const res = await api.get<Booking[]>(endpoint);
      const rawData = res.data || [];
      console.log("Fetched sessions:", rawData);

      // Filter rawData to ensure tutor mode only shows sessions you teach,
      // and student mode only shows sessions you booked as a student.
      const filteredRawData = rawData.filter((item) => {
        if (!userId) return true;
        if (isTutorMode) {
          return item.tutorId === userId;
        } else {
          return item.studentId === userId;
        }
      });

      const mappedSessions = filteredRawData.map((item) => {
        const { date, day, time, duration, endObj } = formatSessionDates(
          item.startTime,
          item.endTime,
        );
        const now = new Date();

        let computedStatus: SessionStatus = "upcoming";
        if (item.status === "CANCELLED") {
          computedStatus = "cancelled";
        } else if (endObj < now) {
          computedStatus = "past";
        }

        const counterpart = isTutorMode ? item.student : item.tutor;
        console.log(
          "Counterpart details:",
          counterpart,
          "for session:",
          item.id,
        );

        const firstName = counterpart?.firstName ?? "";
        const lastName = counterpart?.lastName ?? "";
        const fullName = `${firstName} ${lastName}`.trim();

        const counterpartFullName =
          fullName ||
          counterpart?.email ||
          (isTutorMode ? "Student" : "Tutor");

        return {
          id: item.id,
          counterpartId: counterpart?.id ?? "",
          title: item.subject?.name ?? "Tutoring Session",
          counterpartName: counterpartFullName,
          counterpartRole: isTutorMode ? "Student" : "Tutor",
          credentials: isTutorMode ? "" : (counterpart?.email ?? ""),
          date,
          day,
          time,
          duration,
          mode: "Remote",
          note: item.notes || "",
          status: computedStatus,
          sortDate: item.startTime,
          // Pull the meetingUrl safely from the tutor's profile relation
          meetingUrl: item.tutor?.tutorProfile?.meetingUrl,
          bookingStatus: item.status,
          review: item.review ?? null,
          startTime: item.startTime,
          endTime: item.endTime,
          subject: {
            id: item.subject?.id ?? "",
            name: item.subject?.name ?? "Tutoring Session",
          },
          tutor: {
            id: item.tutor?.id ?? "",
            firstName: item.tutor?.firstName ?? null,
            lastName: item.tutor?.lastName ?? null,
            email: item.tutor?.email ?? "",
          },
        } as UnifiedSession;
      }) satisfies UnifiedSession[];

      setSessions(mappedSessions);
    } catch (err: unknown) {
      if (axios.isAxiosError<{ message: string; error?: string }>(err)) {
        toast.error(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Failed to load sessions",
        );
      } else {
        toast.error("Failed to load sessions");
      }
    } finally {
      setLoading(false);
    }
  }, [isTutorMode, userId]);

  useEffect(() => {
    // If the role changed, mark loading state without in-body synchronous setState
    if (prevRoleRef.current !== activeRole) {
      prevRoleRef.current = activeRole;
      setLoading(true);
    }

    let isMounted = true;

    // Defer the fetch call past synchronous effect execution
    const timer = setTimeout(() => {
      if (isMounted) {
        void fetchSessions();
      }
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [activeRole, fetchSessions]);

  const subjects = useMemo(
    () => [...new Set(sessions.map(({ title }) => title))],
    [sessions],
  );

  const visibleSessions = useMemo(
    () =>
      sessions
        .filter(
          ({ status, title }) =>
            status === activeTab &&
            (subjectFilter === "all" || title === subjectFilter),
        )
        .sort((a, b) => b.sortDate.localeCompare(a.sortDate)),
    [activeTab, subjectFilter, sessions],
  );

  const groupedSessions = useMemo(() => {
    return visibleSessions.reduce<Record<string, UnifiedSession[]>>(
      (groups, session) => {
        const key = `${session.day}, ${session.date}`;
        groups[key] = [...(groups[key] ?? []), session];
        return groups;
      },
      {},
    );
  }, [visibleSessions]);

  const handleAction = async (
    id: string,
    action: "join" | "message" | "reschedule" | "cancel" | "details" | "rate and review",
  ) => {
    const session = sessions.find((item) => item.id === id);
    if (!session) return;
    if (action === "rate and review") {
      return;
    }
    if (action === "cancel") {
      const confirmCancel = window.confirm(
        `Are you sure you want to cancel ${session.title}?`,
      );
      if (!confirmCancel) return;

      try {
        const payload: UpdateBookingStatusPayload = { status: "CANCELLED" };
        await api.patch(`/bookings/${id}/status`, payload);

        toast.success(`${session.title} session cancelled.`);
        setSessions((items) =>
          items.map((item) =>
            item.id === id ? { ...item, status: "cancelled" } : item,
          ),
        );
      } catch (err: unknown) {
        if (axios.isAxiosError<{ message: string; error?: string }>(err)) {
          toast.error(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "Could not cancel session",
          );
        } else {
          toast.error("Failed to cancel session");
        }
      }
      return;
    }

    if (action === "join") {
      if (session.meetingUrl) {
        window.open(session.meetingUrl, "_blank");
      } else {
        toast.error("The tutor has not added a meeting link for this session yet.");
      }
      return;
    }

    if (action === "message") {
      if (!session.counterpartId) {
        toast.error("This session does not have a linked user account.");
        return;
      }

      try {
        const conversation = await createConversation(session.counterpartId);
        navigate(`/messages?conversationId=${conversation.id}`);
      } catch (err: unknown) {
        if (axios.isAxiosError<{ message?: string; error?: string }>(err)) {
          toast.error(err.response?.data?.message || err.response?.data?.error || "Could not open conversation");
        } else {
          toast.error("Could not open conversation");
        }
      }
      return;
    }

    if (action === "details") {
      toast(`Viewing student notes/details for ${session.counterpartName}`, {
        icon: "ℹ️",
      });
    }
  };

  return {
    sessions,
    loading,
    activeTab,
    setActiveTab,
    subjectFilter,
    setSubjectFilter,
    subjects,
    groupedSessions,
    visibleSessions,
    isTutorMode,
    handleAction,
    refreshSessions: fetchSessions,
  };
}












// import { useState, useCallback, useEffect, useMemo, useRef } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { api } from "../api/axios";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import { createConversation } from "../api/messageAPI";
// import {
//   formatSessionDates,
//   type SessionTab,
// } from "../lib/utils/sessionHelpers";
// import type {
//   Booking,
//   UnifiedSession,
//   SessionStatus,
//   UpdateBookingStatusPayload,
// } from "../types";

// export function useSessions() {
//   const { activeRole } = useAuth();
//   const navigate = useNavigate();
//   const isTutorMode = activeRole === "tutor";

//   const [sessions, setSessions] = useState<UnifiedSession[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [activeTab, setActiveTab] = useState<SessionTab>("upcoming");
//   const [subjectFilter, setSubjectFilter] = useState<string>("all");

//   // Track active role shifts without triggering synchronous re-renders in effects
//   const prevRoleRef = useRef(activeRole);

//   const fetchSessions = useCallback(async () => {
//     try {
//       const endpoint = isTutorMode ? "/bookings/tutor" : "/bookings/user";
//       const res = await api.get<Booking[]>(endpoint);
//       const rawData = res.data || [];
//       console.log("Fetched sessions:", rawData);

      

//       const mappedSessions = rawData.map((item) => {
//         const { date, day, time, duration, endObj } = formatSessionDates(
//           item.startTime,
//           item.endTime,
//         );
//         const now = new Date();

//         let computedStatus: SessionStatus = "upcoming";
//         if (item.status === "CANCELLED") {
//           computedStatus = "cancelled";
//         } else if (endObj < now) {
//           computedStatus = "past";
//         }

//         const counterpart = isTutorMode ? item.student : item.tutor;
//         console.log(
//           "Counterpart details:",
//           counterpart,
//           "for session:",
//           item.id,
//         );

//         const firstName = counterpart?.firstName ?? "";
//         const lastName = counterpart?.lastName ?? "";
//         const fullName = `${firstName} ${lastName}`.trim();

//         const counterpartFullName =
//           fullName ||
//           counterpart?.email ||
//           (isTutorMode ? "Student" : "Tutor");

//         return {
//           id: item.id,
//           counterpartId: counterpart?.id ?? "",
//           title: item.subject?.name ?? "Tutoring Session",
//           counterpartName: counterpartFullName,
//           counterpartRole: isTutorMode ? "Student" : "Tutor",
//           credentials: isTutorMode ? "" : (counterpart?.email ?? ""),
//           date,
//           day,
//           time,
//           duration,
//           mode: "Remote",
//           note: item.notes || "",
//           status: computedStatus,
//           sortDate: item.startTime,
//           meetingUrl: item.meetingUrl,
//           bookingStatus: item.status,
//           review: item.review ?? null,
//           startTime: item.startTime,
//           endTime: item.endTime,
//           subject: {
//             id: item.subject?.id ?? "",
//             name: item.subject?.name ?? "Tutoring Session",
//           },
//           tutor: {
//             id: item.tutor?.id ?? "",
//             firstName: item.tutor?.firstName ?? null,
//             lastName: item.tutor?.lastName ?? null,
//             email: item.tutor?.email ?? "",
//           },
//         } as UnifiedSession;
//       }) satisfies UnifiedSession[];

//       setSessions(mappedSessions);
//     } catch (err: unknown) {
//       if (axios.isAxiosError<{ message: string; error?: string }>(err)) {
//         toast.error(
//           err.response?.data?.message ||
//             err.response?.data?.error ||
//             "Failed to load sessions",
//         );
//       } else {
//         toast.error("Failed to load sessions");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [isTutorMode]);

//   useEffect(() => {
//     // If the role changed, mark loading state without in-body synchronous setState
//     if (prevRoleRef.current !== activeRole) {
//       prevRoleRef.current = activeRole;
//       setLoading(true);
//     }

//     let isMounted = true;

//     // Defer the fetch call past synchronous effect execution
//     const timer = setTimeout(() => {
//       if (isMounted) {
//         void fetchSessions();
//       }
//     }, 0);

//     return () => {
//       isMounted = false;
//       clearTimeout(timer);
//     };
//   }, [activeRole, fetchSessions]);

//   const subjects = useMemo(
//     () => [...new Set(sessions.map(({ title }) => title))],
//     [sessions],
//   );

//   const visibleSessions = useMemo(
//     () =>
//       sessions
//         .filter(
//           ({ status, title }) =>
//             status === activeTab &&
//             (subjectFilter === "all" || title === subjectFilter),
//         )
//         .sort((a, b) => b.sortDate.localeCompare(a.sortDate)),
//     [activeTab, subjectFilter, sessions],
//   );

//   const groupedSessions = useMemo(() => {
//     return visibleSessions.reduce<Record<string, UnifiedSession[]>>(
//       (groups, session) => {
//         const key = `${session.day}, ${session.date}`;
//         groups[key] = [...(groups[key] ?? []), session];
//         return groups;
//       },
//       {},
//     );
//   }, [visibleSessions]);

//   const handleAction = async (
//     id: string,
//     action: "join" | "message" | "reschedule" | "cancel" | "details" | "rate and review",
//   ) => {
//     const session = sessions.find((item) => item.id === id);
//     if (!session) return;
//     if (action === "rate and review") {
//     return;
//   }
//     if (action === "cancel") {
//       const confirmCancel = window.confirm(
//         `Are you sure you want to cancel ${session.title}?`,
//       );
//       if (!confirmCancel) return;

//       try {
//         const payload: UpdateBookingStatusPayload = { status: "CANCELLED" };
//         await api.patch(`/bookings/${id}/status`, payload);

//         toast.success(`${session.title} session cancelled.`);
//         setSessions((items) =>
//           items.map((item) =>
//             item.id === id ? { ...item, status: "cancelled" } : item,
//           ),
//         );
//       } catch (err: unknown) {
//         if (axios.isAxiosError<{ message: string; error?: string }>(err)) {
//           toast.error(
//             err.response?.data?.message ||
//               err.response?.data?.error ||
//               "Could not cancel session",
//           );
//         } else {
//           toast.error("Failed to cancel session");
//         }
//       }
//       return;
//     }

//     if (action === "join") {
//       if (session.meetingUrl) {
//         window.open(session.meetingUrl, "_blank");
//       } else {
//         toast.success(`Opening your ${session.title} room...`);
//       }
//       return;
//     }

//     if (action === "message") {
//       if (!session.counterpartId) {
//         toast.error("This session does not have a linked user account.");
//         return;
//       }

//       try {
//         const conversation = await createConversation(session.counterpartId);
//         navigate(`/messages?conversationId=${conversation.id}`);
//       } catch (err: unknown) {
//         if (axios.isAxiosError<{ message?: string; error?: string }>(err)) {
//           toast.error(err.response?.data?.message || err.response?.data?.error || "Could not open conversation");
//         } else {
//           toast.error("Could not open conversation");
//         }
//       }
//       return;
//     }

//     if (action === "details") {
//       toast(`Viewing student notes/details for ${session.counterpartName}`, {
//         icon: "ℹ️",
//       });
//     }

//   };

//   return {
//     sessions,
//     loading,
//     activeTab,
//     setActiveTab,
//     subjectFilter,
//     setSubjectFilter,
//     subjects,
//     groupedSessions,
//     visibleSessions,
//     isTutorMode,
//     handleAction,
//     refreshSessions: fetchSessions,
//   };
// }
