import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';

const ShiftStudents: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [shiftName, setShiftName] = useState<string>('');
  const [filters, setFilters] = useState({ search: '', status: 'all' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const fetchShiftAndStudents = async () => {
      try {
        const shiftResponse = await api.getSchedule(id!);
        setShiftName(shiftResponse.schedule.title || `Shift ${id}`);

        const studentsResponse = await api.getStudentsByShift(id!, filters);
        const fetchedStudents = studentsResponse.students || [];

        const currentDate = new Date('2025-05-05');
        const updatedStudents = fetchedStudents.map((student: any) => {
          const membershipEndDate = new Date(student.membershipEnd);
          const computedStatus = membershipEndDate >= currentDate ? 'active' : 'expired';
          return { ...student, computedStatus };
        });

        setStudents(updatedStudents);
      } catch (err) {
        setError('Failed to load shift details or students. Please try again later.');
        console.error('Failed to fetch shift or students:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShiftAndStudents();
  }, [id, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md dark:bg-gray-800 dark:text-gray-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-40 ${
          isCollapsed ? 'md:w-16' : 'md:w-64'
        }`}
      >
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Students in {shiftName}
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => navigate('/shifts')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back to Shifts
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by name or phone"
                    className="max-w-sm"
                  />
                  <Select value={filters.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading students...</div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No students found for this shift.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.email || 'N/A'}</TableCell>
                          <TableCell>{student.phone || 'N/A'}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                student.computedStatus === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {student.computedStatus}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftStudents;