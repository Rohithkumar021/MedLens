import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  FileText,
  AlertTriangle,
  Trash2,
  ShieldAlert,
  LayoutGrid,
  List,
  ChevronRight
} from 'lucide-react';
import ProvenanceBadge from '../components/ProvenanceBadge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';

export default function PatientsPage({
  patients,
  currentPatient,
  onSelectPatient,
  onNewPatient,
  onDeletePatient
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const filtered = (patients || []).filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.existing_conditions?.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.symptoms?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            Patient Records &amp; Clinical Workspace
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered patient profiles with structured intake history and explicit origin tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-semibold transition ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            variant="clinical"
            size="sm"
            onClick={onNewPatient}
            className="text-xs font-semibold shrink-0 shadow-xs"
          >
            <UserPlus className="w-4 h-4 mr-1.5" /> Add Patient Record
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by patient name, diagnosed condition, or symptom..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-2xs text-slate-900 placeholder-slate-400"
        />
      </div>

      {/* Patients View: Table or Grid */}
      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name &amp; Profile</TableHead>
                <TableHead>Demographics</TableHead>
                <TableHead>Clinical Conditions</TableHead>
                <TableHead>Allergies &amp; Alerts</TableHead>
                <TableHead>Provenance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No patient records match your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => {
                  const isSelected = p.id === currentPatient?.id;
                  const initials = p.name
                    ? p.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    : 'PX';

                  return (
                    <TableRow
                      key={p.id}
                      onClick={() => onSelectPatient(p.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-sky-50/80 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-7 h-7 bg-sky-100 text-sky-800 text-xs font-bold">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">ID: {p.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {p.sex || 'Unspecified'}, {p.age ? `${p.age}y` : 'Age N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {p.existing_conditions?.map((c, i) => (
                            <Badge key={i} variant="clinical" className="text-[10px]">
                              {c}
                            </Badge>
                          )) || <span className="text-slate-400 text-xs">—</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {p.allergies?.map((a, i) => (
                            <Badge key={i} variant="destructive" className="text-[10px]">
                              {a}
                            </Badge>
                          )) || <span className="text-slate-400 text-xs">None</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ProvenanceBadge provenance={p.source || 'USER_PROVIDED'} size="sm" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectPatient(p.id)}
                            className="text-xs text-sky-600 font-semibold"
                          >
                            Open <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm(`Delete patient record for ${p.name}?`)) {
                                onDeletePatient(p.id);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 h-8 w-8"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs shadow-card">
              No patient records match your search criteria.
            </div>
          ) : (
            filtered.map((p) => {
              const isSelected = p.id === currentPatient?.id;
              const initials = p.name
                ? p.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                : 'PX';

              return (
                <Card
                  key={p.id}
                  onClick={() => onSelectPatient(p.id)}
                  className={`cursor-pointer transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                      : 'hover:border-slate-300'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-9 h-9 bg-sky-100 text-sky-800 text-xs font-bold">
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-sm font-bold text-slate-900">{p.name}</CardTitle>
                          <CardDescription className="text-xs text-slate-500 mt-0.5">
                            {p.sex || 'Unspecified'}, {p.age ? `${p.age} yrs` : 'Age N/A'}
                          </CardDescription>
                        </div>
                      </div>
                      <ProvenanceBadge provenance={p.source || 'USER_PROVIDED'} size="sm" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2 py-2">
                    {p.existing_conditions && p.existing_conditions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.existing_conditions.map((c, i) => (
                          <Badge key={i} variant="clinical" className="text-[10.5px]">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {p.allergies && p.allergies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.allergies.map((a, i) => (
                          <Badge key={i} variant="destructive" className="text-[10.5px] flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Allergy: {a}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium">
                        <FileText className="w-3.5 h-3.5 text-slate-400" /> {p.reports_count || 0} Reports
                      </span>
                      {p.conflicts_count > 0 && (
                        <span className="flex items-center gap-1 text-rose-700 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> {p.conflicts_count} Inconsistencies
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete patient record for ${p.name}?`)) {
                          onDeletePatient(p.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      title="Delete Patient Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
