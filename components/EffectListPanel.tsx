"use client";

import React, { useState } from 'react';
import { useEffectSessionStore } from '@/store/useEffectSessionStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  MoreVertical, 
  Play, 
  Edit, 
  Copy, 
  Trash2, 
  Download, 
  Upload,
  Folder,
  FileText,
  Calendar,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EffectListPanelProps {
  onSessionSelect?: (projectId: string, sessionId: string) => void;
  onNewSession?: () => void;
  className?: string;
}

export function EffectListPanel({ onSessionSelect, onNewSession, className }: EffectListPanelProps) {
  const { toast } = useToast();
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isEditSessionOpen, setIsEditSessionOpen] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [deleteProjectName, setDeleteProjectName] = useState<string>('');
  const [deleteSessionName, setDeleteSessionName] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Form states
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionDescription, setNewSessionDescription] = useState('');
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [editSessionName, setEditSessionName] = useState('');
  const [editSessionDescription, setEditSessionDescription] = useState('');

  const {
    projects,
    currentProjectId,
    currentSessionId,
    createNewProject,
    createNewSession,
    deleteProject,
    deleteSession,
    updateProject,
    updateSession,
    setActiveSession,
    duplicateSession,
    duplicateProject,
    exportToFile,
    importFromFile
  } = useEffectSessionStore();

  const currentProject = projects.find(p => p.id === currentProjectId);
  const currentSession = currentProject?.sessions.find(s => s.id === currentSessionId);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive"
      });
      return;
    }

    const projectId = createNewProject(newProjectName.trim(), newProjectDescription.trim() || undefined);
    setNewProjectName('');
    setNewProjectDescription('');
    setIsNewProjectOpen(false);
    
    toast({
      title: "Success",
      description: "Project created successfully"
    });
  };

  const handleCreateSession = () => {
    if (!selectedProjectId || !newSessionName.trim()) {
      toast({
        title: "Error",
        description: "Please select a project and enter a session name",
        variant: "destructive"
      });
      return;
    }

    const sessionId = createNewSession(selectedProjectId, newSessionName.trim(), newSessionDescription.trim() || undefined);
    setNewSessionName('');
    setNewSessionDescription('');
    setIsNewSessionOpen(false);
    setSelectedProjectId(null);
    
    toast({
      title: "Success",
      description: "Session created successfully"
    });

    if (onNewSession) {
      onNewSession();
    }
  };

  const handleSelectSession = (projectId: string, sessionId: string) => {
    setActiveSession(projectId, sessionId);
    if (onSessionSelect) {
      onSessionSelect(projectId, sessionId);
    }
  };

  const handleEditProject = (project: any) => {
    setEditProjectName(project.name);
    setEditProjectDescription(project.description || '');
    setIsEditProjectOpen(true);
  };

  const handleUpdateProject = () => {
    if (!currentProjectId || !editProjectName.trim()) return;

    updateProject(currentProjectId, {
      name: editProjectName.trim(),
      description: editProjectDescription.trim() || undefined
    });

    setEditProjectName('');
    setEditProjectDescription('');
    setIsEditProjectOpen(false);
    
    toast({
      title: "Success",
      description: "Project updated successfully"
    });
  };

  const handleEditSession = (session: any) => {
    setEditSessionName(session.name);
    setEditSessionDescription(session.description || '');
    setIsEditSessionOpen(true);
  };

  const handleUpdateSession = () => {
    if (!currentProjectId || !currentSessionId || !editSessionName.trim()) return;

    updateSession(currentProjectId, currentSessionId, {
      name: editSessionName.trim(),
      description: editSessionDescription.trim() || undefined
    });

    setEditSessionName('');
    setEditSessionDescription('');
    setIsEditSessionOpen(false);
    
    toast({
      title: "Success",
      description: "Session updated successfully"
    });
  };

  const handleDuplicateProject = (projectId: string, projectName: string) => {
    const newName = `${projectName} (Copy)`;
    duplicateProject(projectId, newName);
    toast({
      title: "Success",
      description: "Project duplicated successfully"
    });
  };

  const handleDuplicateSession = (projectId: string, sessionId: string, sessionName: string) => {
    const newName = `${sessionName} (Copy)`;
    duplicateSession(projectId, sessionId, newName);
    toast({
      title: "Success",
      description: "Session duplicated successfully"
    });
  };

  const handleExportProject = (projectId: string, projectName: string) => {
    try {
      const exportData = exportToFile(projectId);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.aurafx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Project exported successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export project",
        variant: "destructive"
      });
    }
  };

  const handleImportProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.aurafx,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const fileContent = event.target?.result as string;
          const projectId = importFromFile(fileContent);
          
          toast({
            title: "Success",
            description: "Project imported successfully"
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to import project",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleDeleteProject = () => {
    if (deleteProjectId) {
      deleteProject(deleteProjectId);
      setDeleteProjectId(null);
      setDeleteProjectName('');
      
      toast({
        title: "Success",
        description: "Project deleted successfully"
      });
    }
  };

  const handleDeleteSession = () => {
    if (deleteSessionId && currentProjectId) {
      deleteSession(currentProjectId, deleteSessionId);
      setDeleteSessionId(null);
      setDeleteSessionName('');
      
      toast({
        title: "Success",
        description: "Session deleted successfully"
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className={`w-80 bg-background border-r border-border flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Effect Sessions</h2>
          <div className="flex gap-2">
            <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Create a new project to organize your effects
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-description">Description (Optional)</Label>
                    <Textarea
                      id="project-description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewProjectOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject}>
                    Create Project
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isNewSessionOpen} onOpenChange={setIsNewSessionOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Session</DialogTitle>
                  <DialogDescription>
                    Create a new effect session
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="session-project">Project</Label>
                    <select
                      id="session-project"
                      className="w-full p-2 border border-input rounded-md"
                      value={selectedProjectId || ''}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                      <option value="">Select a project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="session-name">Session Name</Label>
                    <Input
                      id="session-name"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="Enter session name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="session-description">Description (Optional)</Label>
                    <Textarea
                      id="session-description"
                      value={newSessionDescription}
                      onChange={(e) => setNewSessionDescription(e.target.value)}
                      placeholder="Enter session description"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewSessionOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSession}>
                    Create Session
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Import/Export */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleImportProject}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          {currentProject && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleExportProject(currentProject.id, currentProject.name)}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Projects List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {projects.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No projects yet</p>
              <p className="text-sm">Create your first project to get started</p>
            </div>
          ) : (
            projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {project.name}
                        {project.id === currentProjectId && (
                          <Badge variant="secondary" className="text-xs">Active</Badge>
                        )}
                      </CardTitle>
                      {project.description && (
                        <CardDescription className="text-sm mt-1">
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditProject(project)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateProject(project.id, project.name)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportProject(project.id, project.name)}>
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setDeleteProjectId(project.id);
                            setDeleteProjectName(project.name);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                {project.sessions.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {project.sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            session.id === currentSessionId
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleSelectSession(project.id, session.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-sm">{session.name}</span>
                                {session.isActive && (
                                  <Badge variant="outline" className="text-xs">Active</Badge>
                                )}
                              </div>
                              {session.description && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  {session.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(session.createdAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(session.updatedAt)}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditSession(session)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDuplicateSession(project.id, session.id, session.name)}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setDeleteSessionId(session.id);
                                    setDeleteSessionName(session.name);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-project-name">Project Name</Label>
              <Input
                id="edit-project-name"
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
            <div>
              <Label htmlFor="edit-project-description">Description</Label>
              <Textarea
                id="edit-project-description"
                value={editProjectDescription}
                onChange={(e) => setEditProjectDescription(e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject}>
              Update Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={isEditSessionOpen} onOpenChange={setIsEditSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
            <DialogDescription>
              Update session information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-session-name">Session Name</Label>
              <Input
                id="edit-session-name"
                value={editSessionName}
                onChange={(e) => setEditSessionName(e.target.value)}
                placeholder="Enter session name"
              />
            </div>
            <div>
              <Label htmlFor="edit-session-description">Description</Label>
              <Textarea
                id="edit-session-description"
                value={editSessionDescription}
                onChange={(e) => setEditSessionDescription(e.target.value)}
                placeholder="Enter session description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSessionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSession}>
              Update Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirmation */}
      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteProjectName}"? This action cannot be undone.
              All sessions in this project will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Session Confirmation */}
      <AlertDialog open={!!deleteSessionId} onOpenChange={() => setDeleteSessionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteSessionName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
