"use client"

import { useState } from "react"
import { FileText, Save, Upload, Plus, Trash2, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface HealthRecordFormProps {
  patientName: string
  patientId: string
  onSave?: (data: any) => void
  onCancel?: () => void
}

export function HealthRecordForm({ patientName, patientId, onSave, onCancel }: HealthRecordFormProps) {
  const [formData, setFormData] = useState({
    diagnosis: "",
    symptoms: "",
    treatment: "",
    medications: "",
    notes: "",
    followUp: "",
    recordType: "consultation",
  })

  const [files, setFiles] = useState<{ name: string; type: string; size: string }[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddFile = () => {
    // In a real app, this would handle actual file uploads
    const mockFiles = [
      { name: "blood_test_results.pdf", type: "application/pdf", size: "1.2 MB" },
      { name: "chest_xray.jpg", type: "image/jpeg", size: "3.5 MB" },
      { name: "medical_history.docx", type: "application/docx", size: "0.8 MB" },
    ]

    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)]
    setFiles((prev) => [...prev, randomFile])
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (onSave) {
      onSave({
        ...formData,
        files,
        patientId,
        createdAt: new Date().toISOString(),
      })
    }

    setIsSaving(false)
  }

  const recordTypes = [
    { value: "consultation", label: "Consultation" },
    { value: "diagnosis", label: "Diagnosis" },
    { value: "prescription", label: "Prescription" },
    { value: "lab_result", label: "Lab Result" },
    { value: "imaging", label: "Imaging" },
    { value: "follow_up", label: "Follow-up" },
  ]

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">New Health Record</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Patient: {patientName}</p>
          </div>
          <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">
            <Clock className="w-3 h-3 mr-1" />
            {new Date().toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="recordType">Record Type</Label>
            <Select value={formData.recordType} onValueChange={(value) => handleChange("recordType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select record type" />
              </SelectTrigger>
              <SelectContent>
                {recordTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="followUp">Follow-up Date (if needed)</Label>
            <Input
              id="followUp"
              type="date"
              value={formData.followUp}
              onChange={(e) => handleChange("followUp", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="diagnosis">Diagnosis</Label>
          <Input
            id="diagnosis"
            value={formData.diagnosis}
            onChange={(e) => handleChange("diagnosis", e.target.value)}
            placeholder="Enter diagnosis"
          />
        </div>

        <div>
          <Label htmlFor="symptoms">Symptoms</Label>
          <Textarea
            id="symptoms"
            value={formData.symptoms}
            onChange={(e) => handleChange("symptoms", e.target.value)}
            placeholder="Describe patient symptoms"
            className="min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor="treatment">Treatment Plan</Label>
          <Textarea
            id="treatment"
            value={formData.treatment}
            onChange={(e) => handleChange("treatment", e.target.value)}
            placeholder="Describe the treatment plan"
            className="min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor="medications">Medications</Label>
          <Textarea
            id="medications"
            value={formData.medications}
            onChange={(e) => handleChange("medications", e.target.value)}
            placeholder="List prescribed medications with dosage"
            className="min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Any additional notes or observations"
            className="min-h-[80px]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Attachments</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Plus className="w-4 h-4 mr-1" />
                  Add File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Files</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Drag and drop files here, or click to browse
                    </p>
                    <Button onClick={handleAddFile}>Browse Files</Button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Supported formats: PDF, JPG, PNG, DOCX (Max size: 10MB)
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2 mt-2">
            {files.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 italic">No files attached</div>
            ) : (
              files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md"
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="h-8 w-8 p-0 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            This record will be securely stored on the blockchain and accessible to the patient.
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 bg-gray-50 dark:bg-gray-800/50 p-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Record
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
