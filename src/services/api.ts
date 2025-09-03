const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  token?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  statusCode: number;
}

// Add these new interfaces above your ApiService class

export interface FacultyLecture {
  batchName: string;
  subjectName: string;
  lectureTitle: string;
  batchId: string;
  subjectId: string;
  topicId: string;
  lectureId: string;
  topicName: string;
}

export interface FacultyBatch {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  subjects: {
    _id: string;
    subjectId: string;
    title: string;
    facultyId: string;
    totalLectures: number;
    topics: {
      _id: string;
      topicId: string;
      title: string;
      facultyId: string;
      lectures: {
        _id: string;
        lectureId: string;
        title: string;
        facultyId: string;
        completedAt?: string;
        completedBy?: string;
      }[];
    }[];
  }[];
}

// Business Analytics Interfaces
export interface BusinessOverviewItem {
  batchName: string;
  subjectTitle: string;
  totalLectures: number;
  completedLectures: number;
  lastLecture: string | null;
  faculty: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  batchId: string;
  subjectId: string;
  facultyId: string;
  remainingLectures: number;
  completionRate: number;
}

export interface BusinessActivity {
  batchId: string;
  batchName: string;
  subjectId: string;
  subjectTitle: string;
  facultyId: string;
  topicId: string;
  topicTitle: string;
  lectureId: string;
  lectureTitle: string;
  completedAt: string;
}

export interface BusinessAnalytics {
  totalTeachers: number;
  activeBatches: number;
  activeCourses: number;
  batchCompletion: {
    _id: string;
    batchName: string;
    totalLectures: number;
    completedLectures: number;
    batchId: string;
    completionRate: number;
  }[];
}

export interface MarkLectureCompletedPayload {
  batchId: string;
  subjectId: string;
  topicId: string;
  lectureId: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  statusCode: number;
  token?: string;
  data?: any;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "business" | "faculty";
  phoneNumber: string;
  facultyProfile?: {
    employeeId?: string;
    department?: string;
    specialization?: string[];
    experience?: number;
    qualification?: string;
    joiningDate?: string;
    isActive: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "business" | "faculty";
  phoneNumber: string;
  facultyProfile?: {
    employeeId?: string;
    department?: string;
    specialization?: string[];
    experience?: number;
    qualification?: string;
    joiningDate?: string;
    isActive?: boolean;
  };
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  courseCode: string;
  duration: {
    value: number;
    unit: string;
  };
  status: "active" | "inactive" | "draft";
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  subjects: Subject[];
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  _id: string;
  title: string;
  description: string;
  order: number;
  topics: Topic[];
}

export interface Topic {
  _id: string;
  title: string;
  description: string;
  order: number;
  estimatedHours: number;
  lectures: Lecture[];
}

export interface Lecture {
  _id: string;
  title: string;
  description: string;
  order: number;
  durationMinutes: number;
}

export interface CreateCoursePayload {
  title: string;
  description: string;
  courseCode: string;
  duration: {
    value: number;
    unit: string;
  };
  status: "active" | "inactive" | "draft";
}

export interface UpdateCoursePayload {
  courseId: string;
  title: string;
  description: string;
  courseCode: string;
  duration: {
    value: number;
    unit: string;
  };
  status: "active" | "inactive" | "draft";
}

export interface AddSubjectPayload {
  courseId: string;
  title: string;
  description: string;
  order: number;
}

export interface UpdateSubjectPayload {
  courseId: string;
  subjectId: string;
  title: string;
  description: string;
  order: number;
}

export interface AddTopicPayload {
  courseId: string;
  subjectId: string;
  title: string;
  description: string;
  order: number;
  estimatedHours: number;
}

export interface UpdateTopicPayload {
  courseId: string;
  subjectId: string;
  topicId: string;
  title: string;
  description: string;
  estimatedHours: number;
}

export interface AddLecturePayload {
  courseId: string;
  subjectId: string;
  topicId: string;
  title: string;
  description: string;
  order: number;
}

export interface UpdateLecturePayload {
  courseId: string;
  subjectId: string;
  topicId: string;
  lectureId: string;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface Batch {
  _id: string;
  name: string;
  courseTemplateId: string;
  startDate: string;
  endDate: string;
  subjects: BatchSubject[];
  createdAt: string;
  updatedAt: string;
}

export interface BatchSubject {
  _id: string;
  subjectId: string;
  title: string;
  facultyId: string;
  totalLectures: number;
  topics: BatchTopic[];
}

export interface BatchTopic {
  _id: string;
  topicId: string;
  title: string;
  facultyId: string;
  lectures: BatchLecture[];
}

export interface BatchLecture {
  _id: string;
  lectureId: string;
  title: string;
  facultyId: string;
}

export interface CreateBatchPayload {
  name: string;
  courseTemplateId: string;
  startDate: string;
  facultyAssignments: Record<string, string>; // subjectId -> facultyId mapping
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  private removeAuthToken(): void {
    localStorage.removeItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if token exists
    const token = this.getAuthToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // If unauthorized, remove token and redirect to login
        if (response.status === 401 || response.status === 403) {
          this.removeAuthToken();
          // You might want to trigger a logout here
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Auth APIs
  async login(payload: LoginPayload): Promise<ApiResponse<any>> {
    const response = await this.request<any>("/user/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    
    // Store the token if login is successful
    if (response.success && response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    this.removeAuthToken();
  }

  // User APIs
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>("/user");
  }

  async getAllUsers(
    pagination?: PaginationParams
  ): Promise<ApiResponse<User[]>> {
    const params = new URLSearchParams();

    if (pagination) {
      if (pagination.page) params.append("page", pagination.page.toString());
      if (pagination.limit) params.append("limit", pagination.limit.toString());
      if (pagination.sortBy) params.append("sortBy", pagination.sortBy);
      if (pagination.sortOrder)
        params.append("sortOrder", pagination.sortOrder);
      if (pagination.search) params.append("search", pagination.search);
      if (pagination.status) params.append("status", pagination.status);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/user/list?${queryString}` : "/user/list";

    return this.request<User[]>(endpoint);
  }

  async listAllFaculties(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>("/user/list/faculty");
  }

  async createUser(payload: CreateUserPayload): Promise<ApiResponse<User>> {
    return this.request<User>("/user/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Course APIs
  async createCourse(
    payload: CreateCoursePayload
  ): Promise<ApiResponse<Course>> {
    return this.request<Course>("/course/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getAllCourses(): Promise<ApiResponse<Course[]>> {
    return this.request<Course[]>("/course/all");
  }
  async getCourses(
    pagination?: PaginationParams
  ): Promise<ApiResponse<Course[]>> {
    const params = new URLSearchParams();

    if (pagination) {
      if (pagination.page) params.append("page", pagination.page.toString());
      if (pagination.limit) params.append("limit", pagination.limit.toString());
      if (pagination.sortBy) params.append("sortBy", pagination.sortBy);
      if (pagination.sortOrder)
        params.append("sortOrder", pagination.sortOrder);
      if (pagination.search) params.append("search", pagination.search);
      if (pagination.status) params.append("status", pagination.status);
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `/course/list?${queryString}`
      : "/course/list";

    return this.request<Course[]>(endpoint);
  }

  async getCourseById(courseId: string): Promise<ApiResponse<Course>> {
    return this.request<Course>(`/course/${courseId}`);
  }

  async updateCourse(
    payload: UpdateCoursePayload
  ): Promise<ApiResponse<Course>> {
    return this.request<Course>("/course/update", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // Subject APIs
  async addSubject(payload: AddSubjectPayload): Promise<ApiResponse<any>> {
    return this.request<any>("/course/add-subject", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateSubject(
    payload: UpdateSubjectPayload
  ): Promise<ApiResponse<any>> {
    return this.request<any>("/course/update/subject", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // Topic APIs
  async addTopic(payload: AddTopicPayload): Promise<ApiResponse<any>> {
    return this.request<any>("/course/add-topic", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateTopic(payload: UpdateTopicPayload): Promise<ApiResponse<any>> {
    return this.request<any>("/course/update/topic", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // Lecture APIs
  async addLecture(payload: AddLecturePayload): Promise<ApiResponse<any>> {
    return this.request<any>("/course/add-lecture", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateLecture(
    payload: UpdateLecturePayload
  ): Promise<ApiResponse<any>> {
    return this.request<any>("/course/update/lecture", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  // Batch APIs
  async createBatch(payload: CreateBatchPayload): Promise<ApiResponse<Batch>> {
    return this.request<Batch>("/batch/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async getBatches(
    pagination?: PaginationParams
  ): Promise<ApiResponse<Batch[]>> {
    const params = new URLSearchParams();

    if (pagination) {
      if (pagination.page) params.append("page", pagination.page.toString());
      if (pagination.limit) params.append("limit", pagination.limit.toString());
      if (pagination.sortBy) params.append("sortBy", pagination.sortBy);
      if (pagination.sortOrder)
        params.append("sortOrder", pagination.sortOrder);
      if (pagination.search) params.append("search", pagination.search);
      if (pagination.status) params.append("status", pagination.status);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/batch/list?${queryString}` : "/batch/list";

    return this.request<Batch[]>(endpoint);
  }

  // Faculty APIs
  async getFacultyLectures(): Promise<ApiResponse<FacultyLecture[]>> {
    return this.request<FacultyLecture[]>("/batch/get/lectures");
  }

  async getFacultySubjects(): Promise<ApiResponse<FacultyBatch[]>> {
    return this.request<FacultyBatch[]>("/batch/get/subjects");
  }

  async markLectureCompleted(
    payload: MarkLectureCompletedPayload
  ): Promise<ApiResponse<any>> {
    return this.request<any>("/batch/complete/lecture", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Faculty Analytics APIs
  async getFacultyAnalytics(): Promise<ApiResponse<FacultyAnalytics>> {
    return this.request<FacultyAnalytics>("/batch/faculty/analytics");
  }

  async getFacultyRecentActivity(): Promise<
    ApiResponse<FacultyRecentActivity[]>
  > {
    return this.request<FacultyRecentActivity[]>(
      "/batch/faculty/recent-activity"
    );
  }

  async getFacultyProgress(): Promise<ApiResponse<FacultyProgressBatch[]>> {
    return this.request<FacultyProgressBatch[]>("/batch/faculty/progress");
  }

  // Business Analytics APIs
  async getBusinessOverview(): Promise<ApiResponse<BusinessOverviewItem[]>> {
    return this.request<BusinessOverviewItem[]>("/batch/business/overview");
  }

  async getBusinessActivity(): Promise<ApiResponse<BusinessActivity[]>> {
    return this.request<BusinessActivity[]>("/batch/business/activity");
  }

  async getBusinessAnalytics(): Promise<ApiResponse<BusinessAnalytics>> {
    return this.request<BusinessAnalytics>("/batch/business/analytics");
  }
}

export const apiService = new ApiService();
