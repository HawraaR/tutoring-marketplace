import { Request, Response } from "express";
import multer from "multer";
import { prisma } from "../db";
import { supabase } from "../supabase"; // Adjust path to your supabase config

// 1. Configure Multer with 10MB limit and memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// 2. Export middleware for routes (accepts up to 5 files with field name 'certificates')
export const uploadCertificateMiddleware = upload.array("certificates", 5);

const getUserId = (req: Request): string | undefined =>
  (req as any).user?.userId || (req as any).user?.id;

// Helper to upload files to Supabase Storage and get public URLs
async function uploadFilesToSupabase(
  files: Express.Multer.File[],
  userId: string,
): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const fileName = `${userId}-${Date.now()}-${file.originalname}`;

    const { data, error } = await supabase.storage
      .from("certificates")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("certificates")
      .getPublicUrl(data.path);

    uploadedUrls.push(publicUrlData.publicUrl);
  }

  return uploadedUrls;
}

export const applyAsTutor = async (req: Request, res: Response) => {
  try {
    console.log("Multer parsed req.body:", req.body);
  console.log("Multer parsed req.files:", req.files);
    const userId = getUserId(req);
    const {
      headline,
      bio,
      hourlyRate,
      subjectIds,
      education,
      languages,
      experience,
      meetingUrl,
    } = req.body;

    console.log("Received tutor meeting url:", meetingUrl )

    // Process & normalize meeting URL
    let formattedMeetingUrl: string | null = null;

if (typeof meetingUrl === "string" && meetingUrl.trim() !== "") {
  let cleanedUrl = meetingUrl.trim();

  // 1. Prepend protocol if missing
  if (!/^https?:\/\//i.test(cleanedUrl)) {
    cleanedUrl = `https://${cleanedUrl}`;
  }

  // 2. Validate using Native URL Parser instead of tricky regex
  try {
    const parsed = new URL(cleanedUrl);
    
    // Ensure it has a valid hostname with at least one dot (e.g. meet.google.com)
    if (!parsed.hostname.includes(".")) {
      throw new Error("Invalid domain");
    }

    formattedMeetingUrl = parsed.toString();
  } catch {
    return res.status(400).json({
      error: "Please enter a valid meeting link (e.g. meet.google.com/abc-defg-hij)",
    });
  }
}

    // Check if user already has a tutor profile
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { tutorProfile: true },
    });

    if (existingUser?.tutorProfile) {
      return res
        .status(400)
        .json({ error: "Tutor profile already exists for this user" });
    }

    // Process file uploads if any certificates were submitted
    let certificateUrls: string[] = [];
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      certificateUrls = await uploadFilesToSupabase(files, userId!);
    }

    // Safely parse JSON strings (FormData transmits arrays as JSON strings)
    const parsedLanguages =
      typeof languages === "string"
        ? JSON.parse(languages)
        : languages || ["English"];
    const parsedExperience =
      typeof experience === "string"
        ? JSON.parse(experience)
        : experience || [];
    const parsedSubjectIds =
      typeof subjectIds === "string" ? JSON.parse(subjectIds) : subjectIds;

    // Create profile in Prisma with the uploaded certificate URLs
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // isTutor: true,
        tutorProfile: {
          create: {
            headline,
            bio,
            hourlyRate: parseFloat(hourlyRate) || 0,
            education,
            languages: parsedLanguages,
            certificates: certificateUrls,
            experience: parsedExperience,
            meetingUrl: formattedMeetingUrl,
            verificationStatus: "PENDING",
          },
        },
      },
      select: {
        id: true,
        email: true,
        isStudent: true,
        isTutor: true,
        isAdmin: true,
        tutorProfile: true,
      },
    });

    // Link taught subjects
    if (Array.isArray(parsedSubjectIds) && parsedSubjectIds.length > 0) {
      await prisma.tutorSubject.createMany({
        data: parsedSubjectIds.map((subjectId: string) => ({
          tutorId: userId!,
          subjectId,
        })),
        skipDuplicates: true,
      });
    }

    return res.status(201).json({
      message: "Tutor application submitted successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Apply Tutor Error:", error);
    return res.status(500).json({ error: "Failed to create tutor profile" });
  }
};

// POST /api/tutors/apply
// export const applyAsTutor = async (req: Request, res: Response) => {
//   try {
//     const userId = getUserId(req);
//     const {
//       headline,
//       bio,
//       hourlyRate,
//       subjectIds,
//       education,
//       languages,
//       experience,
//     } = req.body;

//     // Check if user already has a tutor profile
//     const existingUser = await prisma.user.findUnique({
//       where: { id: userId },
//       include: { tutorProfile: true },
//     });

//     if (existingUser?.tutorProfile) {
//       return res
//         .status(400)
//         .json({ error: "Tutor profile already exists for this user" });
//     }

//     // Process file uploads if any certificates were submitted
//     let certificateUrls: string[] = [];
//     const files = req.files as Express.Multer.File[];
//     if (files && files.length > 0) {
//       certificateUrls = await uploadFilesToSupabase(files, userId!);
//     }

//     // Safely parse JSON strings (FormData transmits arrays as JSON strings)
//     const parsedLanguages =
//       typeof languages === "string"
//         ? JSON.parse(languages)
//         : languages || ["English"];
//     const parsedExperience =
//       typeof experience === "string"
//         ? JSON.parse(experience)
//         : experience || [];
//     const parsedSubjectIds =
//       typeof subjectIds === "string" ? JSON.parse(subjectIds) : subjectIds;

//     // Create profile in Prisma with the uploaded certificate URLs
//     const updatedUser = await prisma.user.update({
//       where: { id: userId },
//       data: {
//         // isTutor: true,
//         tutorProfile: {
//           create: {
//             headline,
//             bio,
//             hourlyRate: parseFloat(hourlyRate) || 0,
//             education,
//             languages: parsedLanguages,
//             certificates: certificateUrls,
//             experience: parsedExperience,
//             verificationStatus: "PENDING",
//           },
//         },
//       },
//       select: {
//         id: true,
//         email: true,
//         isStudent: true,
//         isTutor: true,
//         isAdmin: true,
//         tutorProfile: true,
//       },
//     });

//     // Link taught subjects
//     if (Array.isArray(parsedSubjectIds) && parsedSubjectIds.length > 0) {
//       await prisma.tutorSubject.createMany({
//         data: parsedSubjectIds.map((subjectId: string) => ({
//           tutorId: userId!,
//           subjectId,
//         })),
//         skipDuplicates: true,
//       });
//     }

//     return res.status(201).json({
//       message: "Tutor application submitted successfully",
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Apply Tutor Error:", error);
//     return res.status(500).json({ error: "Failed to create tutor profile" });
//   }
// };

// GET /api/tutors/me — the logged-in user's own tutor profile + selected subjects
export const getMyTutorProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tutorProfile: true,
        tutorSubjects: { include: { subject: true } },
      },
    });

    if (!user?.tutorProfile) {
      return res.status(404).json({ error: "No tutor profile found" });
    }

    return res.status(200).json({
      profile: user.tutorProfile,
      subjects: user.tutorSubjects.map((ts) => ts.subject),
    });
  } catch (error) {
    console.error("Get My Tutor Profile Error:", error);
    return res.status(500).json({ error: "Failed to fetch tutor profile" });
  }
};




export const updateMyTutorProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const existing = await prisma.tutorProfile.findUnique({
      where: { userId },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ error: "No tutor profile found. Apply as a tutor first." });
    }
    if (existing.verificationStatus !== "APPROVED") {
      return res.status(403).json({
        error: "Your profile is not approved yet, so it cannot be edited.",
      });
    }

    const {
      headline,
      bio,
      education,
      hourlyRate,
      meetingUrl,
      subjectIds,
      languages,
      existingCertificates,
      experience,
    } = req.body;

    // 1. Process & normalize meeting URL if passed
    let formattedMeetingUrl: string | null | undefined = undefined;

    if (meetingUrl !== undefined) {
      if (typeof meetingUrl === "string" && meetingUrl.trim() !== "") {
        let cleanedUrl = meetingUrl.trim();

        if (!/^https?:\/\//i.test(cleanedUrl)) {
          cleanedUrl = `https://${cleanedUrl}`;
        }

        try {
          const parsed = new URL(cleanedUrl);
          if (!parsed.hostname.includes(".")) {
            throw new Error("Invalid domain");
          }
          formattedMeetingUrl = parsed.toString();
        } catch {
          return res.status(400).json({
            error:
              "Please enter a valid meeting link (e.g. meet.google.com/abc-defg-hij)",
          });
        }
      } else {
        // If empty string or null was sent, reset meetingUrl to null
        formattedMeetingUrl = null;
      }
    }

    // 2. Process newly uploaded files via Multer (`req.files`)
    const files = req.files as Express.Multer.File[] | undefined;
    let newCertificateUrls: string[] = [];

    if (files && files.length > 0) {
      newCertificateUrls = await uploadFilesToSupabase(files, userId!);
    }

    // 3. Normalize existing certificates
    let keptCertificates: string[] = [];
    if (existingCertificates) {
      let parsedCertificates = existingCertificates;
      if (typeof existingCertificates === "string") {
        try {
          parsedCertificates = JSON.parse(existingCertificates);
        } catch {
          parsedCertificates = [existingCertificates];
        }
      }
      keptCertificates = Array.isArray(parsedCertificates)
        ? parsedCertificates
        : [parsedCertificates];
    }

    // 4. Combine kept existing certificates with newly uploaded ones
    const finalCertificates = [...keptCertificates, ...newCertificateUrls];

    // 5. Parse JSON strings safely (handles FormData inputs)
    const parseIfString = (val: any) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    const parsedLanguages = parseIfString(languages);
    const parsedExperience = parseIfString(experience);
    const parsedSubjectIds = parseIfString(subjectIds);

    // 6. Build dynamic update object
    const data: Record<string, unknown> = {};
    if (headline !== undefined) data.headline = headline;
    if (bio !== undefined) data.bio = bio;
    if (education !== undefined) data.education = education;
    if (hourlyRate !== undefined) data.hourlyRate = parseFloat(hourlyRate) || 0;
    if (formattedMeetingUrl !== undefined) data.meetingUrl = formattedMeetingUrl;
    if (parsedLanguages !== undefined) data.languages = parsedLanguages;
    if (finalCertificates.length > 0) data.certificates = finalCertificates;
    if (parsedExperience !== undefined) data.experience = parsedExperience;

    const [profile] = await prisma.$transaction([
      prisma.tutorProfile.update({ where: { userId }, data }),
      ...(Array.isArray(parsedSubjectIds)
        ? [
            prisma.tutorSubject.deleteMany({ where: { tutorId: userId } }),
            prisma.tutorSubject.createMany({
              data: parsedSubjectIds.map((subjectId: string) => ({
                tutorId: userId!,
                subjectId,
              })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);

    return res.status(200).json({ message: "Tutor profile updated", profile });
  } catch (error) {
    console.error("Update Tutor Profile Error:", error);
    return res.status(500).json({ error: "Failed to update tutor profile" });
  }
};










// PATCH /api/tutors/me — only an APPROVED tutor may edit their own profile
// export const updateMyTutorProfile = async (req: Request, res: Response) => {
//   try {
//     const userId = getUserId(req);

//     const existing = await prisma.tutorProfile.findUnique({
//       where: { userId },
//     });
//     if (!existing) {
//       return res
//         .status(404)
//         .json({ error: "No tutor profile found. Apply as a tutor first." });
//     }
//     if (existing.verificationStatus !== "APPROVED") {
//       return res.status(403).json({
//         error: "Your profile is not approved yet, so it cannot be edited.",
//       });
//     }

//     const {
//       headline,
//       bio,
//       education,
//       hourlyRate,
//       subjectIds,
//       languages,
//       existingCertificates,
//       experience,
//     } = req.body;

//     // 1. Process newly uploaded files via Multer (`req.files`) and pass userId
//     const files = req.files as Express.Multer.File[] | undefined;
//     let newCertificateUrls: string[] = [];

//     if (files && files.length > 0) {
//       newCertificateUrls = await uploadFilesToSupabase(files, userId!);
//     }

//     // 2. Normalize existing certificates
//     let keptCertificates: string[] = [];
//     if (existingCertificates) {
//       keptCertificates = Array.isArray(existingCertificates)
//         ? existingCertificates
//         : [existingCertificates];
//     }

//     // 3. Combine kept existing certificates with newly uploaded ones
//     const finalCertificates = [...keptCertificates, ...newCertificateUrls];

//     const data: Record<string, unknown> = {};
//     if (headline !== undefined) data.headline = headline;
//     if (bio !== undefined) data.bio = bio;
//     if (education !== undefined) data.education = education;
//     if (hourlyRate !== undefined) data.hourlyRate = parseFloat(hourlyRate) || 0;
//     if (languages !== undefined) data.languages = languages;
//     if (finalCertificates.length > 0) data.certificates = finalCertificates;
//     if (experience !== undefined) data.experience = experience;

//     const [profile] = await prisma.$transaction([
//       prisma.tutorProfile.update({ where: { userId }, data }),
//       ...(Array.isArray(subjectIds)
//         ? [
//             prisma.tutorSubject.deleteMany({ where: { tutorId: userId } }),
//             prisma.tutorSubject.createMany({
//               data: subjectIds.map((subjectId: string) => ({
//                 tutorId: userId!,
//                 subjectId,
//               })),
//               skipDuplicates: true,
//             }),
//           ]
//         : []),
//     ]);

//     return res.status(200).json({ message: "Tutor profile updated", profile });
//   } catch (error) {
//     console.error("Update Tutor Profile Error:", error);
//     return res.status(500).json({ error: "Failed to update tutor profile" });
//   }
// };

// export const updateMyTutorProfile = async (req: Request, res: Response) => {
//   try {
//     const userId = getUserId(req);

//     const existing = await prisma.tutorProfile.findUnique({ where: { userId } });
//     if (!existing) {
//       return res.status(404).json({ error: "No tutor profile found. Apply as a tutor first." });
//     }
//     if (existing.verificationStatus !== "APPROVED") {
//       return res.status(403).json({ error: "Your profile is not approved yet, so it cannot be edited." });
//     }

//     const {
//       headline,
//       bio,
//       education,
//       hourlyRate,
//       subjectIds,
//       languages,
//       certificates,
//       experience,
//     } = req.body;

//     const data: Record<string, unknown> = {};
//     if (headline !== undefined) data.headline = headline;
//     if (bio !== undefined) data.bio = bio;
//     if (education !== undefined) data.education = education;
//     if (hourlyRate !== undefined) data.hourlyRate = parseFloat(hourlyRate) || 0;
//     if (languages !== undefined) data.languages = languages;
//     if (certificates !== undefined) data.certificates = certificates;
//     if (experience !== undefined) data.experience = experience;

//     const [profile] = await prisma.$transaction([
//       prisma.tutorProfile.update({ where: { userId }, data }),
//       ...(Array.isArray(subjectIds)
//         ? [
//             prisma.tutorSubject.deleteMany({ where: { tutorId: userId } }),
//             prisma.tutorSubject.createMany({
//               data: subjectIds.map((subjectId: string) => ({ tutorId: userId!, subjectId })),
//               skipDuplicates: true,
//             }),
//           ]
//         : []),
//     ]);

//     return res.status(200).json({ message: "Tutor profile updated", profile });
//   } catch (error) {
//     console.error("Update Tutor Profile Error:", error);
//     return res.status(500).json({ error: "Failed to update tutor profile" });
//   }
// };

// GET /api/tutors/applications?status=PENDING|APPROVED|REJECTED — admin only

export const listTutorApplications = async (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string)?.toUpperCase() || "PENDING";

    const applications = await prisma.tutorProfile.findMany({
      where: {
        verificationStatus: status as "PENDING" | "APPROVED" | "REJECTED",
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({ applications });
  } catch (error) {
    console.error("List Tutor Applications Error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch tutor applications" });
  }
};

// Adjust import to match your setup
export const reviewTutorApplication = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;

    // Accept status OR action, in uppercase OR lowercase
    const input = req.body.status || req.body.action || "";
    const normalized = String(input).trim().toUpperCase();

    const isApproved = normalized === "APPROVED" || normalized === "APPROVE";

    // 1. Fetch profile to grab linked userId
    const profile = await prisma.tutorProfile.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!profile) {
      return res.status(404).json({ error: "Tutor profile not found" });
    }

    // 2. Sync both User and TutorProfile tables inside a transaction
    const [updatedUser, updatedProfile] = await prisma.$transaction([
      prisma.user.update({
        where: { id: profile.userId },
        data: { isTutor: isApproved },
      }),
      prisma.tutorProfile.update({
        where: { id: profile.id },
        data: {
          verificationStatus: isApproved ? "APPROVED" : "REJECTED",
          rejectionReason: isApproved ? null : req.body.rejectionReason,
        },
      }),
    ]);

    return res.status(200).json({
      message: `Application ${isApproved ? "approved" : "rejected"} successfully`,
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Review Application Error:", error);
    return res.status(500).json({ error: "Failed to review application" });
  }
};

// PATCH /api/tutors/applications/:id — admin only
// export const reviewTutorApplication = async (req: Request, res: Response) => {
//   try {
//     const id = req.params.id as string;
//     const { action, rejectionReason } = req.body;

//     const existing = await prisma.tutorProfile.findUnique({ where: { id } });
//     if (!existing) {
//       return res.status(404).json({ error: "Tutor application not found" });
//     }

//     const profile = await prisma.tutorProfile.update({
//       where: { id },
//       data: {
//         verificationStatus: action === "approve" ? "APPROVED" : "REJECTED",
//         rejectionReason: action === "approve" ? null : rejectionReason,
//       },
//     });

//     return res.status(200).json({ message: `Application ${action}d`, profile });
//   } catch (error) {
//     console.error("Review Tutor Application Error:", error);
//     return res.status(500).json({ error: "Failed to review tutor application" });
//   }
// };

// GET /api/tutors/:id — public
export const getTutorById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const tutor = await prisma.user.findUnique({
      where: { id },
      include: {
        tutorProfile: true,
        tutorSubjects: { include: { subject: true } },
        availability: {
          where: { isBooked: false, startTime: { gte: new Date() } },
          orderBy: { startTime: "asc" },
        },
        tutorReviews: {
          include: {
            booking: { include: { subject: true } }, // ← subject via the session
            student: { select: { id: true, firstName: true, lastName: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (
      !tutor ||
      !tutor.tutorProfile ||
      tutor.tutorProfile.verificationStatus !== "APPROVED"
    ) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }

    const completedSessions = await prisma.booking.count({
      where: { tutorId: id, status: "COMPLETED" },
    });

    return res.status(200).json({
      id: tutor.id,
      email: tutor.email,
      firstName: tutor.firstName,
      lastName: tutor.lastName,
      tutorProfile: tutor.tutorProfile,
      tutorSubjects: tutor.tutorSubjects,
      availability: tutor.availability,
      stats: { completedSessions },
      reviews: tutor.tutorReviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        sessionDate: r.booking.startTime, // the session being reviewed
        subject: r.booking.subject,
        student: r.student,
      })),
    });
  } catch (error) {
    console.error("GET /api/tutors/:id failed:", error);
    return res.status(500).json({ error: "Failed to fetch tutor details" });
  }
};

// GET /api/tutors  — public, no auth middleware
export const getTutors = async (_req: Request, res: Response) => {
  try {
    const tutors = await prisma.user.findMany({
      where: {
        isTutor: true,
        tutorProfile: { verificationStatus: "APPROVED" },
      },
      include: {
        tutorProfile: true,
        tutorSubjects: { include: { subject: true } },
        availability: {
          where: { isBooked: false, startTime: { gte: new Date() } },
          orderBy: { startTime: "asc" },
        },
      },
    });
    res.json(tutors); // Date fields auto-serialize to ISO strings → matches TutorListItem
  } catch (error) {
    console.error("GET /api/tutors failed:", error);
    res.status(500).json({ message: "Failed to fetch tutors" });
  }
};
