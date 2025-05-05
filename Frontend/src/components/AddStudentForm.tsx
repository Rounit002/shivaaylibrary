import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../services/api';
import Select from 'react-select';

const AddStudentForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membershipStart: '',
    membershipEnd: '',
    shiftId: '',
    seatId: null as number | null,
    fee: '',
    image: null as File | null,
    imageUrl: '',
    address: '',
  });
  const [shifts, setShifts] = useState<any[]>([]);
  const [seats, setSeats] = useState<any[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const shiftsResponse = await api.getSchedules();
        setShifts(shiftsResponse.schedules);
      } catch (error) {
        console.error('Failed to fetch shifts:', error);
        toast.error('Failed to load shifts');
      }
    };
    fetchShifts();
  }, []);

  useEffect(() => {
    const fetchSeats = async () => {
      if (formData.shiftId) {
        setLoadingSeats(true);
        try {
          const seatsResponse = await api.getSeats(formData.shiftId);
          setSeats(seatsResponse.seats);
        } catch (error) {
          console.error('Failed to fetch seats:', error);
          toast.error('Failed to load seats');
        } finally {
          setLoadingSeats(false);
        }
      } else {
        setSeats([]);
      }
    };
    fetchSeats();
  }, [formData.shiftId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (file.size > 200 * 1024) {
        toast.error('Image size exceeds 200KB limit');
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const availableSeats = seats.filter((seat: any) => !seat.isAssigned);
  const seatOptions = [
    { value: null, label: 'None' },
    ...availableSeats.map((seat: any) => ({ value: seat.id, label: seat.seatNumber })),
  ];

  const handleSubmit = async () => {
    // Validate required fields (only name, membershipStart, and membershipEnd are required)
    const requiredFields = [
      { key: 'name', label: 'Name' },
      { key: 'membershipStart', label: 'Membership Start' },
      { key: 'membershipEnd', label: 'Membership End' },
    ];

    for (const field of requiredFields) {
      const value = formData[field.key as keyof typeof formData];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    // Validate email format only if email is provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    try {
      let imageUrl = '';
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);
        const uploadResponse = await api.uploadImage(imageFormData);
        imageUrl = uploadResponse.imageUrl;
      }

      const studentData = {
        ...formData,
        shiftId: formData.shiftId ? parseInt(formData.shiftId, 10) : null,
        seatId: formData.seatId,
        fee: formData.fee ? parseFloat(formData.fee) : null,
        status: 'active',
        profileImageUrl: imageUrl,
        address: formData.address.trim() || null, // Convert empty string to null
        email: formData.email || null, // Allow email to be null
        phone: formData.phone || null, // Allow phone to be null
      };

      const response = await api.addStudent(studentData);
      toast.success('Student added successfully');
      navigate('/students');
    } catch (error: any) {
      console.error('Failed to add student:', error);
      toast.error(error.message || 'Failed to add student');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Student</h1>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div>
          <label htmlFor="membershipStart" className="block text-sm font-medium text-gray-700 mb-1">
            Membership Start
          </label>
          <input
            type="date"
            id="membershipStart"
            name="membershipStart"
            value={formData.membershipStart}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div>
          <label htmlFor="membershipEnd" className="block text-sm font-medium text-gray-700 mb-1">
            Membership End
          </label>
          <input
            type="date"
            id="membershipEnd"
            name="membershipEnd"
            value={formData.membershipEnd}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div>
          <label htmlFor="shiftId" className="block text-sm font-medium text-gray-700 mb-1">
            Select Shift
          </label>
          <select
            id="shiftId"
            name="shiftId"
            value={formData.shiftId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="">-- Select Shift --</option>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.title} at {shift.description}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="seatId" className="block text-sm font-medium text-gray-700 mb-1">
            Select Seat
          </label>
          {loadingSeats ? (
            <div>Loading seats...</div>
          ) : (
            <Select
              id="seatId"
              name="seatId"
              options={seatOptions}
              value={seatOptions.find((option) => option.value === formData.seatId)}
              onChange={(selected) =>
                setFormData((prev) => ({ ...prev, seatId: selected ? selected.value : null }))
              }
              isSearchable
              placeholder="Select a seat or None"
              className="w-full"
            />
          )}
        </div>
        <div>
          <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-1">
            Fee
          </label>
          <input
            type="number"
            id="fee"
            name="fee"
            value={formData.fee}
            onChange={handleChange}
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Profile Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          {formData.image && (
            <img
              src={URL.createObjectURL(formData.image)}
              alt="Preview"
              className="mt-2 max-w-xs rounded"
            />
          )}
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-200"
        >
          Add Student
        </button>
      </div>
    </div>
  );
};

export default AddStudentForm;