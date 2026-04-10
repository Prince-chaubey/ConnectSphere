import React, { useState, useEffect } from "react";
import Layout from "../../Components/Layout/Layout";
import axios from "axios";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Camera,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Plus,
  Code2,
  Link,
  Globe,
  Briefcase,
  Clock,
  DollarSign,
  Mail,
  Phone,
  FileText,
  Users,
  Folder,
  Star,
  Loader2,
  Activity,
  Upload,
  Download,
} from "lucide-react";

const Profile = () => {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isReadOnly = Boolean(id && id !== currentUser.id);

  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [user, setUser] = useState({
    name: "",
    role: "user",
    email: "",
    phone: "",
    location: "",
    joined: "",
    bio: "",
    resume: "",
    skills: [],
    stats: {
      applications: 0,
      teamsJoined: 0,
      projectsCreated: 0,
      rating: 0,
    },
    social: {
      github: "",
      linkedin: "",
      portfolio: "",
    },
    experience: "Beginner",
    availability: "Available",
    hourlyRate: 0,
  });

  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = API_URL.replace("/api", "");

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Format date for better readability
  const formatJoinedDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Fetch live location
  const fetchLiveLocation = () => {
    setFetchingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            );
            if (response.data) {
              const city =
                response.data.address?.city ||
                response.data.address?.town ||
                response.data.address?.village ||
                "";
              const state = response.data.address?.state || "";
              const country = response.data.address?.country || "";
              let locationString = "";
              if (city) locationString = city;
              if (state && !city) locationString = state;
              if (country && locationString) locationString += `, ${country}`;
              else if (country) locationString = country;
              if (!locationString) locationString = "Location detected";

              setUser({
                ...user,
                location: locationString,
              });
              toast.success(`Location detected: ${locationString}`);
            }
          } catch (error) {
            console.error("Error getting location name:", error);
            toast.error("Could not get location name. Please enter manually.");
          } finally {
            setFetchingLocation(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Unable to fetch location. ";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage +=
                "Please allow location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "Please enter your location manually.";
          }
          toast.error(errorMessage);
          setFetchingLocation(false);
        },
      );
    } else {
      toast.error(
        "Geolocation is not supported by your browser. Please enter location manually.",
      );
      setFetchingLocation(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      const endpoint = id ? `${API_URL}/user/profile/${id}` : `${API_URL}/user/profile`;
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setUser({
          ...user,
          ...response.data.user,
          social: { ...user.social, ...(response.data.user.social || {}) },
          stats: { ...user.stats, ...(response.data.user.stats || {}) },
          skills: response.data.user.skills || [],
        });
      }
    } catch (error) {
      console.error(
        "Error fetching profile:",
        error.response?.data || error.message,
      );
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);

      // Upload to backend
      await updateProfilePicture(file);
    }
  };

  const updateProfilePicture = async (file) => {
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("profilePic", file);

      const response = await axios.put(
        `${API_URL}/user/profile/picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        setUser({
          ...user,
          profilePic: response.data.user.profilePic,
        });
        localStorage.setItem("user", JSON.stringify(response.data.user));
        toast.success("Profile picture updated!");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture.");
      // Revert preview on failure
      setProfileImage(null);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !user.skills.includes(newSkill.trim())) {
      setUser({
        ...user,
        skills: [...user.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setUser({
      ...user,
      skills: user.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddSkill();
    }
  };

  const updateResumeFile = async (file) => {
    try {
      setIsUploadingResume(true);
      const token = getToken();
      const formData = new FormData();
      formData.append("resume", file);

      const response = await axios.put(
        `${API_URL}/user/profile/resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        setUser({
          ...user,
          resume: response.data.user.resume,
        });
        localStorage.setItem("user", JSON.stringify(response.data.user));
        toast.success("Resume uploaded successfully!");
      }
    } catch (error) {
      console.error("Error updating resume:", error);
      toast.error(error.response?.data?.message || "Failed to upload resume.");
      setResumeFile(null);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      await updateResumeFile(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleSocialChange = (platform, value) => {
    setUser({
      ...user,
      social: {
        ...user.social,
        [platform]: value,
      },
    });
  };

  const handleSaveProfile = async () => {
    const token = getToken();
    try {
      setSaving(true);

      const response = await axios.put(
        `${API_URL}/user/profile`,
        {
          name: user.name,
          bio: user.bio,
          location: user.location,
          skills: user.skills,
          social: user.social,
          experience: user.experience,
          availability: user.availability,
          hourlyRate: user.hourlyRate,
          phone: user.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setUser({
          ...user,
          ...response.data.user,
          social: { ...user.social, ...(response.data.user.social || {}) },
          stats: { ...user.stats, ...(response.data.user.stats || {}) },
          skills: response.data.user.skills || [],
        });
        setIsEditing(false);

        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      if (!token) return toast.error("You must be login to Update Profile !");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
          <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-xl shadow-blue-500/5 border border-blue-100/50">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-gray-600 font-medium">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const userProfilePicSrc =
    profileImage ||
    (user.profilePic && user.profilePic.startsWith("http")
      ? user.profilePic
      : user.profilePic
        ? `${BASE_URL}${user.profilePic}`
        : null);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-80px)] bg-[#f8fafc] p-4 sm:p-6 lg:p-8 font-sans pb-16">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* TOP PROFILE CARD */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-md">
            {/* Cover Photo Gradient */}
            <div className="h-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            </div>

            <div className="px-6 pb-8 relative sm:px-10">
              {/* Avatar section */}
              <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-16 sm:-mt-20 mb-4 gap-4">
                <div className="relative group inline-block">
                  <label className={`block relative ${isReadOnly ? '' : 'cursor-pointer'}`}>
                    {!isReadOnly && (
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    )}
                    {userProfilePicSrc ? (
                      <img
                        src={userProfilePicSrc}
                        alt="profile"
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                      />
                    ) : (
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold border-4 border-white shadow-lg">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    {!isReadOnly && (
                      <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 backdrop-blur-sm">
                        <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                    )}
                  </label>
                </div>

                {!isReadOnly && (
                  <div className="flex gap-3 self-end w-full sm:w-auto">
                  <button
                    onClick={() =>
                      isEditing ? handleSaveProfile() : setIsEditing(true)
                    }
                    disabled={saving}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm active:translate-y-0 ${
                      isEditing
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/25 hover:shadow-green-500/40"
                        : "bg-white border-2 border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200 hover:shadow-gray-200/50"
                    } disabled:opacity-70 disabled:pointer-events-none`}
                  >
                    {isEditing ? (
                      <>
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </>
                    )}
                  </button>
                  {isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        fetchUserProfile();
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-full transition-colors flex items-center justify-center"
                      title="Cancel editing"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                )}
              </div>

              {/* User Info Details */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                      {user.name}
                    </h2>
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50/80 text-blue-700 text-sm font-semibold mt-3 border border-blue-100/50 shadow-sm">
                      {user.role === "creator"
                        ? "Content Creator"
                        : user.role === "admin"
                          ? "Administrator"
                          : "User Member"}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-5 text-sm sm:text-base text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    <span>{user.email}</span>
                  </div>

                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 pr-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                        <Phone className="w-4 h-4 text-green-500 ml-2" />
                        <input
                          type="tel"
                          name="phone"
                          value={user.phone || ""}
                          onChange={handleInputChange}
                          className="bg-transparent border-none px-2 py-1 focus:outline-none w-32 sm:w-40 text-sm"
                          placeholder="Phone number"
                        />
                      </div>

                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 pr-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                        <MapPin className="w-4 h-4 text-red-400 ml-2" />
                        <input
                          type="text"
                          name="location"
                          value={user.location || ""}
                          onChange={handleInputChange}
                          className="bg-transparent border-none px-2 py-1 focus:outline-none w-40 sm:w-48 text-sm"
                          placeholder="Your location"
                        />
                        <button
                          onClick={fetchLiveLocation}
                          disabled={fetchingLocation}
                          title="Detect Location"
                          className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition disabled:opacity-50"
                        >
                          {fetchingLocation ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {user.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                          <span>{user.phone}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                        <span>{user.location || "Location not specified"}</span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    <span>Joined {formatJoinedDate(user.joined)}</span>
                  </div>
                </div>

                {/* Bio text area */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <FileText className="w-4 h-4 text-indigo-500" /> About Me
                  </h3>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={user.bio || ""}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y min-h-[120px] text-gray-700 placeholder-gray-400"
                      placeholder="Write a brief introduction about yourself..."
                    />
                  ) : (
                    <p className="text-gray-600 leading-relaxed max-w-4xl text-sm sm:text-base bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                      {user.bio || (
                        <span className="text-gray-400 italic">
                          No description provided yet. Editing your profile to
                          add an about section.
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info (Spans 2 cols on lg) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Skills Widget */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" /> Skills &
                    Expertise
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {user.skills &&
                    user.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 text-sm font-semibold flex items-center gap-2 border border-indigo-100/50 transition-all hover:bg-white hover:border-indigo-200 hover:shadow-sm"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-red-500 hover:bg-red-50 text-indigo-400 transition-colors bg-white/80 rounded-full p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </span>
                    ))}

                  {!isEditing && (!user.skills || user.skills.length === 0) && (
                    <div className="p-4 w-full rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center text-gray-500 text-sm">
                      No skills added yet.
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex items-center gap-3 mt-6 p-1.5 bg-gray-50 rounded-2xl border border-gray-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-inner">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a skill and press enter..."
                      className="flex-1 bg-transparent border-none px-4 py-2 focus:outline-none text-sm placeholder-gray-400 font-medium"
                    />
                    <button
                      onClick={handleAddSkill}
                      disabled={!newSkill.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-sm mr-0.5 active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                )}
              </div>

              {/* Professional Details Widget */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <Briefcase className="w-5 h-5 text-blue-500" /> Professional
                  Details
                </h3>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-3 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                      <Star className="w-4 h-4 text-orange-400" /> Experience
                    </span>
                    {isEditing ? (
                      <select
                        name="experience"
                        value={user.experience || "Beginner"}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm text-gray-700 text-sm font-medium"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Expert">Expert</option>
                      </select>
                    ) : (
                      <p className="font-bold text-gray-900">
                        {user.experience || "Beginner"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                      <Clock className="w-4 h-4 text-green-500" /> Availability
                    </span>
                    {isEditing ? (
                      <select
                        name="availability"
                        value={user.availability || "Available"}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm text-gray-700 text-sm font-medium"
                      >
                        <option value="Available">Available</option>
                        <option value="Busy">Busy</option>
                        <option value="Looking for team">
                          Looking for team
                        </option>
                        <option value="Not available">Not available</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shadow-sm border border-white ${user.availability === "Available" ? "bg-green-500" : user.availability === "Busy" ? "bg-amber-500" : "bg-gray-400"}`}
                        ></span>
                        <p className="font-bold text-gray-900">
                          {user.availability || "Available"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                    <span className="flex items-center gap-2 text-sm font-semibold text-gray-500">
                      <DollarSign className="w-4 h-4 text-emerald-500" /> Hourly
                      Rate
                    </span>
                    {isEditing ? (
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                          $
                        </span>
                        <input
                          type="number"
                          name="hourlyRate"
                          value={user.hourlyRate || 0}
                          onChange={handleInputChange}
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white shadow-sm text-gray-700 text-sm font-medium"
                        />
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <p className="font-bold text-gray-900 text-xl">
                          ${user.hourlyRate || 0}
                        </p>
                        <span className="text-gray-500 text-sm font-medium">
                          /hr
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume Widget */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-500" /> Resume / CV
                  </h3>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 md:p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  {resumeFile || user.resume ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm w-full max-w-md text-left">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                            {isUploadingResume ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate">
                              {resumeFile ? resumeFile.name : (user.resume ? "My_Resume.pdf" : "")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {isUploadingResume ? "Uploading..." : "Ready to view"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                          <button 
                            className="py-2 flex-1 text-blue-600 hover:bg-blue-50 bg-blue-50/50 border border-blue-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm font-semibold shadow-sm"
                            onClick={() => window.open(user.resume, '_blank')}
                          >
                            <Download className="w-4 h-4" /> Download
                          </button>
                          
                          {!isReadOnly && (
                            <label className={`py-2 flex-1 text-gray-600 hover:bg-gray-50 bg-white border border-gray-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm font-semibold shadow-sm cursor-pointer ${isUploadingResume ? 'opacity-50 pointer-events-none' : ''}`}>
                              <Upload className="w-4 h-4" /> Replace
                              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeChange} disabled={isUploadingResume} />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-4">
                      {isReadOnly ? (
                        <>
                          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-2 shadow-sm">
                            <FileText className="w-8 h-8" />
                          </div>
                          <h4 className="text-gray-700 font-semibold text-lg">No resume uploaded</h4>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2 shadow-sm">
                            <Upload className="w-8 h-8" />
                          </div>
                          <h4 className="text-gray-700 font-semibold text-lg">Upload your resume</h4>
                          <p className="text-sm text-gray-500 max-w-sm mb-4">Supported formats: PDF, DOCX. Max size: 5MB.</p>
                          
                          <label className={`cursor-pointer bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 px-8 py-3 rounded-xl font-semibold transition-all shadow-md shadow-red-500/20 inline-flex flex-col items-center ${isUploadingResume ? 'opacity-50 pointer-events-none' : 'hover:-translate-y-0.5 active:translate-y-0'}`}>
                            <span className="flex items-center gap-2">
                              {isUploadingResume ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                              ) : (
                                <><Upload className="w-5 h-5" /> Browse Files</>
                              )}
                            </span>
                            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeChange} disabled={isUploadingResume} />
                          </label>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Links */}
            <div className="space-y-6">
              {/* Activity Stats */}
              <div className="bg-gradient-to-br from-[#1e1b4b] to-indigo-900 rounded-3xl shadow-lg p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/4"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl transform -translate-x-1/3 translate-y-1/3"></div>

                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10 select-none">
                  Analytics Overview
                </h3>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="bg-white/[0.06] rounded-2xl p-4 backdrop-blur-md border border-white/10 hover:bg-white/[0.1] transition-colors">
                    <Folder className="w-5 h-5 text-blue-300 mb-2" />
                    <p className="text-3xl font-extrabold font-mono">
                      {user.stats?.applications || 0}
                    </p>
                    <p className="text-blue-200/70 text-xs mt-1 font-semibold tracking-wider uppercase">
                      Applied
                    </p>
                  </div>
                  <div className="bg-white/[0.06] rounded-2xl p-4 backdrop-blur-md border border-white/10 hover:bg-white/[0.1] transition-colors">
                    <Users className="w-5 h-5 text-indigo-300 mb-2" />
                    <p className="text-3xl font-extrabold font-mono">
                      {user.stats?.teamsJoined || 0}
                    </p>
                    <p className="text-indigo-200/70 text-xs mt-1 font-semibold tracking-wider uppercase">
                      Teams
                    </p>
                  </div>
                  <div className="bg-white/[0.06] rounded-2xl p-4 backdrop-blur-md border border-white/10 hover:bg-white/[0.1] transition-colors">
                    <Activity className="w-5 h-5 text-purple-300 mb-2" />
                    <p className="text-3xl font-extrabold font-mono">
                      {user.stats?.projectsCreated || 0}
                    </p>
                    <p className="text-purple-200/70 text-xs mt-1 font-semibold tracking-wider uppercase">
                      Projects
                    </p>
                  </div>
                  <div className="bg-gradient-to-b from-yellow-500/20 to-yellow-600/10 rounded-2xl p-4 backdrop-blur-md border border-yellow-500/20 shadow-inner">
                    <Star className="w-5 h-5 text-yellow-400 mb-2 fill-yellow-400/20 text-yellow-500" />
                    <div className="flex items-end gap-1">
                      <p className="text-3xl font-extrabold font-mono text-yellow-400">
                        {user.stats?.rating || "0.0"}
                      </p>
                    </div>
                    <p className="text-yellow-200/70 text-xs mt-1 font-semibold tracking-wider uppercase">
                      Avg Rating
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links Widget */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-md">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-teal-500" /> Connect
                </h3>

                <div className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                          <Code2 className="w-5 h-5 text-gray-700" />
                        </div>
                        <input
                          type="url"
                          placeholder="GitHub Profile URL"
                          value={user.social?.github || ""}
                          onChange={(e) =>
                            handleSocialChange("github", e.target.value)
                          }
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-sm font-medium transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                          <Link className="w-5 h-5 text-blue-600" />
                        </div>
                        <input
                          type="url"
                          placeholder="LinkedIn Profile URL"
                          value={user.social?.linkedin || ""}
                          onChange={(e) =>
                            handleSocialChange("linkedin", e.target.value)
                          }
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-sm font-medium transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 shadow-sm">
                          <Globe className="w-5 h-5 text-purple-600" />
                        </div>
                        <input
                          type="url"
                          placeholder="Portfolio Website URL"
                          value={user.social?.portfolio || ""}
                          onChange={(e) =>
                            handleSocialChange("portfolio", e.target.value)
                          }
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 text-sm font-medium transition-all"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {user.social?.github && (
                        <a
                          href={
                            user.social.github.startsWith("http")
                              ? user.social.github
                              : `https://${user.social.github}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 border border-gray-100 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 group-hover:scale-105 transition-transform shadow-sm">
                              <Code2 className="w-5 h-5 group-hover:text-black" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-800 text-sm block">
                                GitHub
                              </span>
                              <span className="text-gray-400 text-xs">
                                Developer Profile
                              </span>
                            </div>
                          </div>
                        </a>
                      )}

                      {user.social?.linkedin && (
                        <a
                          href={
                            user.social.linkedin.startsWith("http")
                              ? user.social.linkedin
                              : `https://${user.social.linkedin}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50/50 border border-gray-100 hover:border-blue-100 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform shadow-sm">
                              <Link className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-800 text-sm block">
                                LinkedIn
                              </span>
                              <span className="text-gray-400 text-xs">
                                Professional Network
                              </span>
                            </div>
                          </div>
                        </a>
                      )}

                      {user.social?.portfolio && (
                        <a
                          href={
                            user.social.portfolio.startsWith("http")
                              ? user.social.portfolio
                              : `https://${user.social.portfolio}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50/50 border border-gray-100 hover:border-purple-100 transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform shadow-sm">
                              <Globe className="w-5 h-5 group-hover:text-purple-700" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-800 text-sm block">
                                Portfolio
                              </span>
                              <span className="text-gray-400 text-xs">
                                Personal Website
                              </span>
                            </div>
                          </div>
                        </a>
                      )}

                      {(!user.social ||
                        (!user.social.github &&
                          !user.social.linkedin &&
                          !user.social.portfolio)) && (
                        <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center gap-2">
                          <Globe className="w-8 h-8 text-gray-300" />
                          <p className="text-gray-500 text-sm font-medium">
                            No social links connected
                          </p>
                          <p className="text-gray-400 text-xs">
                            Edit profile to add your web presence
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
