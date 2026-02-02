

# PHASE 2E — Cohérence UX Métier & Prévisibilité Utilisateur

## Validation CTO intégrée

Ce plan inclut les 2 micro-ajustements CTO obligatoires :
1. **ExcelReporting.tsx** : Commentaire documentant l'hypothèse synchrone
2. **Appointments.tsx** : Commentaires confirmant que les toasts sont strictement APRÈS `await mutateAsync` dans le `try`

---

## Scope final (3 fichiers)

| # | Fichier | Modifications |
|---|---------|---------------|
| 1 | `src/components/modules/Appointments.tsx` | 3 toasts succès + commentaires CTO |
| 2 | `src/components/modules/ExcelReporting.tsx` | Import hook + toast succès/erreur + commentaire CTO |
| 3 | `src/components/modules/Patients.tsx` | Message confirmation métier |

---

## Modifications détaillées

### 1. Appointments.tsx

**Lignes 127-141** — `handleSaveAppointment`

```text
AVANT:
if (editingAppointment) {
  await updateMutation.mutateAsync({ id: editingAppointment.id, data: appointmentData });
  
  if (appointmentData.status === 'completed' && appointmentData.consumedProducts && appointmentData.consumedProducts.length > 0) {
    await processConsumedProducts(appointmentData.consumedProducts);
  }
  
  if (appointmentData.status === 'completed') {
    const fullAppointment = { ...appointmentData, id: editingAppointment.id };
    setAppointmentForInvoice(fullAppointment as Appointment);
    setShowInvoiceModal(true);
  }
} else {
  await createMutation.mutateAsync(appointmentData);
}

APRES:
if (editingAppointment) {
  await updateMutation.mutateAsync({ id: editingAppointment.id, data: appointmentData });
  
  // Toast succès APRÈS mutation réussie (jamais en finally)
  toast({
    title: "Succès",
    description: "Rendez-vous modifié avec succès"
  });
  
  if (appointmentData.status === 'completed' && appointmentData.consumedProducts && appointmentData.consumedProducts.length > 0) {
    await processConsumedProducts(appointmentData.consumedProducts);
  }
  
  if (appointmentData.status === 'completed') {
    const fullAppointment = { ...appointmentData, id: editingAppointment.id };
    setAppointmentForInvoice(fullAppointment as Appointment);
    setShowInvoiceModal(true);
  }
} else {
  await createMutation.mutateAsync(appointmentData);
  
  // Toast succès APRÈS mutation réussie (jamais en finally)
  toast({
    title: "Succès",
    description: "Rendez-vous créé avec succès"
  });
}
```

**Lignes 177-186** — `updateAppointmentStatus`

```text
AVANT:
} else {
  // Récupérer l'appointment complet et mettre à jour seulement le statut
  const appointment = appointments.find(a => a.id === appointmentId);
  if (appointment) {
    const updatedAppointment: Omit<Appointment, 'id'> = {
      ...appointment,
      status
    };
    await updateMutation.mutateAsync({ id: appointmentId, data: updatedAppointment });
  }
}

APRES:
} else {
  // Récupérer l'appointment complet et mettre à jour seulement le statut
  const appointment = appointments.find(a => a.id === appointmentId);
  if (appointment) {
    const updatedAppointment: Omit<Appointment, 'id'> = {
      ...appointment,
      status
    };
    await updateMutation.mutateAsync({ id: appointmentId, data: updatedAppointment });
    
    // Toast succès APRÈS mutation réussie (jamais en finally)
    toast({
      title: "Succès",
      description: "Statut du rendez-vous mis à jour"
    });
  }
}
```

---

### 2. ExcelReporting.tsx

**Lignes 1-7** — Ajout import + hook

```text
AVANT:
import React, { useState } from 'react';
import { FileSpreadsheet, Download, Calendar, Users, TrendingUp, Package } from 'lucide-react';
import { usePatientsQuery } from '../../queries/patients.queries';
import { useAppointmentsQuery } from '../../queries/appointments.queries';
import { useInventory } from '../../hooks/useInventory';

const ExcelReporting: React.FC = () => {

APRES:
import React, { useState } from 'react';
import { FileSpreadsheet, Download, Calendar, Users, TrendingUp, Package } from 'lucide-react';
import { usePatientsQuery } from '../../queries/patients.queries';
import { useAppointmentsQuery } from '../../queries/appointments.queries';
import { useInventory } from '../../hooks/useInventory';
import { useToast } from '../../hooks/use-toast';

const ExcelReporting: React.FC = () => {
  const { toast } = useToast();
```

**Lignes 154-181** — `handleGenerateReport` avec commentaire CTO

```text
AVANT:
const handleGenerateReport = async () => {
  // GUARD: empêcher double génération
  if (!selectedReport || isGenerating) return;
  
  setIsGenerating(true);
  
  try {
    switch (selectedReport) {
      case 'patients':
        generatePatientsReport();
        break;
      case 'appointments':
        generateAppointmentsReport();
        break;
      case 'revenue':
        generateRevenueReport();
        break;
      case 'inventory':
        generateInventoryReport();
        break;
    }
  } catch (error) {
    console.error('Erreur génération rapport:', error);
    alert('Erreur lors de la génération du rapport');
  } finally {
    setIsGenerating(false);
  }
};

APRES:
const handleGenerateReport = async () => {
  // GUARD: empêcher double génération
  if (!selectedReport || isGenerating) return;
  
  setIsGenerating(true);
  
  try {
    switch (selectedReport) {
      case 'patients':
        generatePatientsReport();
        break;
      case 'appointments':
        generateAppointmentsReport();
        break;
      case 'revenue':
        generateRevenueReport();
        break;
      case 'inventory':
        generateInventoryReport();
        break;
    }
    
    // Hypothèse : la génération Excel est synchrone (generateCSV / Blob).
    // Si asynchrone à l'avenir, déplacer ce toast après await.
    toast({
      title: "Succès",
      description: "Rapport Excel généré avec succès"
    });
  } catch (error) {
    console.error('Erreur génération rapport:', error);
    toast({
      title: "Erreur",
      description: "Erreur lors de la génération du rapport",
      variant: "destructive"
    });
  } finally {
    setIsGenerating(false);
  }
};
```

---

### 3. Patients.tsx

**Ligne 99** — Message confirmation métier

```text
AVANT:
if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {

APRES:
if (!confirm('Ce patient et tout son historique seront définitivement supprimés. Cette action est irréversible. Voulez-vous continuer ?')) {
```

---

## Diff Git attendu

```diff
--- a/src/components/modules/Appointments.tsx
+++ b/src/components/modules/Appointments.tsx
@@ -127,6 +127,11 @@ const Appointments: React.FC = () => {
       if (editingAppointment) {
         await updateMutation.mutateAsync({ id: editingAppointment.id, data: appointmentData });
         
+        // Toast succès APRÈS mutation réussie (jamais en finally)
+        toast({
+          title: "Succès",
+          description: "Rendez-vous modifié avec succès"
+        });
+        
         if (appointmentData.status === 'completed' && appointmentData.consumedProducts && appointmentData.consumedProducts.length > 0) {
           await processConsumedProducts(appointmentData.consumedProducts);
         }
@@ -139,6 +144,11 @@ const Appointments: React.FC = () => {
         }
       } else {
         await createMutation.mutateAsync(appointmentData);
+        
+        // Toast succès APRÈS mutation réussie (jamais en finally)
+        toast({
+          title: "Succès",
+          description: "Rendez-vous créé avec succès"
+        });
       }
       
       setShowAddModal(false);
@@ -183,6 +193,11 @@ const Appointments: React.FC = () => {
           status
         };
         await updateMutation.mutateAsync({ id: appointmentId, data: updatedAppointment });
+        
+        // Toast succès APRÈS mutation réussie (jamais en finally)
+        toast({
+          title: "Succès",
+          description: "Statut du rendez-vous mis à jour"
+        });
       }
     }
   } catch (err) {
```

```diff
--- a/src/components/modules/ExcelReporting.tsx
+++ b/src/components/modules/ExcelReporting.tsx
@@ -4,7 +4,10 @@ import { FileSpreadsheet, Download, Calendar, Users, TrendingUp, Package } from
 import { usePatientsQuery } from '../../queries/patients.queries';
 import { useAppointmentsQuery } from '../../queries/appointments.queries';
 import { useInventory } from '../../hooks/useInventory';
+import { useToast } from '../../hooks/use-toast';
 
 const ExcelReporting: React.FC = () => {
+  const { toast } = useToast();
+
   const [selectedReport, setSelectedReport] = useState<string>('');
@@ -171,10 +174,21 @@ const ExcelReporting: React.FC = () => {
         case 'inventory':
           generateInventoryReport();
           break;
       }
+      
+      // Hypothèse : la génération Excel est synchrone (generateCSV / Blob).
+      // Si asynchrone à l'avenir, déplacer ce toast après await.
+      toast({
+        title: "Succès",
+        description: "Rapport Excel généré avec succès"
+      });
     } catch (error) {
       console.error('Erreur génération rapport:', error);
-      alert('Erreur lors de la génération du rapport');
+      toast({
+        title: "Erreur",
+        description: "Erreur lors de la génération du rapport",
+        variant: "destructive"
+      });
     } finally {
       setIsGenerating(false);
     }
```

```diff
--- a/src/components/modules/Patients.tsx
+++ b/src/components/modules/Patients.tsx
@@ -96,7 +96,7 @@ const Patients: React.FC = () => {
     // GUARD: empêcher double suppression
     if (deleteMutation.isPending) return;
     
-    if (!confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
+    if (!confirm('Ce patient et tout son historique seront définitivement supprimés. Cette action est irréversible. Voulez-vous continuer ?')) {
       return;
     }
```

---

## Résumé des modifications

| Fichier | Lignes modifiées | Description |
|---------|------------------|-------------|
| `Appointments.tsx` | ~129, ~147, ~193 | 3 toasts succès + commentaires CTO |
| `ExcelReporting.tsx` | ~6, ~9, ~174-185 | Import + hook + toast succès/erreur + commentaire CTO |
| `Patients.tsx` | ~99 | Message confirmation métier |

**Total : 3 fichiers, ~25 lignes modifiées**

---

## Critères d'acceptation

- [ ] Création RDV : toast "Rendez-vous créé avec succès"
- [ ] Modification RDV : toast "Rendez-vous modifié avec succès"
- [ ] Changement statut RDV : toast "Statut du rendez-vous mis à jour"
- [ ] Génération Excel : toast "Rapport Excel généré avec succès"
- [ ] Erreur Excel : toast erreur (rouge, pas alert)
- [ ] Suppression patient : message métier complet
- [ ] Commentaires CTO présents (3 occurrences)
- [ ] Aucune régression Phase 2D
- [ ] UI strictement identique

