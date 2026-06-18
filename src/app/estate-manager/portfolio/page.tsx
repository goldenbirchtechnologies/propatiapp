import { Metadata } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: 'Portfolio | PROPATI Estate Manager',
  description: 'Manage your property portfolio',
};

export default async function EstateManagerPortfolioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
          <p className="text-muted-foreground">Overview of all properties and units in your organization</p>
        </div>
        <a href="/estate-manager/portfolio/new" className="btn-primary">
          <span>+ Add Property</span>
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Properties" value="24" icon="Building2" change="+2 this month" />
        <StatCard title="Total Units" value="156" icon="Home" change="+8 this month" />
        <StatCard title="Occupancy Rate" value="87%" icon="Users" trend="up" />
        <StatCard title="Monthly Revenue" value="₦12.4M" icon="DollarSign" change="+12% vs last month" />
      </div>

      {/* Filters & Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Properties</h3>
          <div className="flex gap-2">
            <select className="input-sm" defaultValue="all">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="vacant">Vacant</option>
            </select>
            <input 
              type="search" 
              placeholder="Search properties..." 
              className="input-sm w-64"
            />
          </div>
        </div>
        <div className="card-content p-0">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Property</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Area</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Units</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Occupied</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Monthly Rent</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockProperties.map((property) => (
                <tr key={property.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{property.name}</div>
                    <div className="text-sm text-muted-foreground">{property.address}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{property.area}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{property.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{property.totalUnits}</td>
                  <td className="px-4 py-3 text-sm">{property.occupiedUnits} / {property.totalUnits}</td>
                  <td className="px-4 py-3 text-sm font-mono">₦{property.monthlyRent.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={property.status === 'active' ? 'default' : property.status === 'maintenance' ? 'secondary' : 'outline'}>
                      {property.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`/estate-manager/portfolio/${property.id}`} className="text-sm text-primary hover:underline">View</a>
                      <a href={`/estate-manager/portfolio/${property.id}/edit`} className="text-sm text-muted-foreground hover:text-foreground">Edit</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Mock data for development
const mockProperties = [
  { id: '1', name: 'Palm Grove Estate', address: '12 Palm Avenue, Lekki', area: 'Lekki', type: 'Residential', totalUnits: 24, occupiedUnits: 22, monthlyRent: 850000, status: 'active' },
  { id: '2', name: 'Victoria Court', address: '45 Victoria Island', area: 'Victoria Island', type: 'Commercial', totalUnits: 12, occupiedUnits: 10, monthlyRent: 2100000, status: 'active' },
  { id: '3', name: 'Ikeja Heights', address: '78 Allen Avenue, Ikeja', area: 'Ikeja', type: 'Residential', totalUnits: 36, occupiedUnits: 28, monthlyRent: 650000, status: 'maintenance' },
  { id: '4', name: 'Lekki Gardens Phase 2', address: 'Lekki-Epe Expressway', area: 'Lekki', type: 'Residential', totalUnits: 48, occupiedUnits: 42, monthlyRent: 950000, status: 'active' },
  { id: '5', name: 'Adeniyi Jones Plaza', address: '12 Adeniyi Jones, Ikeja', area: 'Ikeja', type: 'Commercial', totalUnits: 8, occupiedUnits: 6, monthlyRent: 1800000, status: 'vacant' },
];

function StatCard({ title, value, icon: Icon, change, trend }: { 
  title: string; 
  value: string; 
  icon: React.ComponentType<{ className?: string }>;
  change?: string; 
  trend?: 'up' | 'down';
}) {
  const icons = { Building2: (props: any) => <Building2 {...props} />, Home: (props: any) => <Home {...props} />, Users: (props: any) => <Users {...props} />, DollarSign: (props: any) => <DollarSign {...props} /> };
  const Comp = icons[Icon as keyof typeof icons] || Building2;
  
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-lg text-primary">
          <Comp className="h-6 w-6" />
        </div>
      </div>
      {change && (
        <p className={`mt-2 text-sm ${trend === 'down' ? 'text-destructive' : 'text-green-600'}`}>
          {trend === 'up' && <span className="inline-block mr-1">↑</span>}
          {trend === 'down' && <span className="inline-block mr-1">↓</span>}
          {change}
        </p>
      )}
    </div>
  );
}

import { Building2, Home, Users, DollarSign } from 'lucide-react';