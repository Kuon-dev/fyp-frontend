import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/v1/user/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!dashboardData) return null;

  const { purchaseHistory, accountInfo, usageStatistics, recommendations } = dashboardData;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={accountInfo.profile?.profileImg} />
              <AvatarFallback>{accountInfo.email[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{accountInfo.profile?.name || 'N/A'}</p>
              <p className="text-sm text-gray-500">{accountInfo.email}</p>
              <Badge variant={accountInfo.emailVerified ? "success" : "destructive"}>
                {accountInfo.emailVerified ? "Verified" : "Not Verified"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase History */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Total Spent: ${purchaseHistory.totalSpent.toFixed(2)}</p>
          <p>Components Bought: {purchaseHistory.componentsBought}</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseHistory.recentPurchases.map((purchase, index) => (
                <TableRow key={index}>
                  <TableCell>{purchase.codeRepo.name}</TableCell>
                  <TableCell>{new Date(purchase.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageStatistics.mostUsedComponents}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usageCount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Components</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5">
            {recommendations.recommendations.map((component, index) => (
              <li key={index}>{component.name}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
