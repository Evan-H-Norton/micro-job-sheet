import React, { useState, useEffect, useContext, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Button, useMediaQuery, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Box, Menu, MenuItem, Slide, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTheme } from '@mui/material/styles';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc, addDoc, query, where } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './App';
import toast from 'react-hot-toast';
import JobSheetForm from './JobSheetForm';
import PartsPage from './PartsPage';
import PDFViewer from './PDFViewer';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

function NewJobSheetPage() {
    const location = useLocation();
    const orderTypeInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const [companies, setCompanies] = useState([]);
    const [companyNameInput, setCompanyNameInput] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);

    const [jobNumber, setJobNumber] = useState('');
    const [orderType, setOrderType] = useState(null);
    const [orderValue, setOrderValue] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [faultComplaint, setFaultComplaint] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [totalTime, setTotalTime] = useState('');

    const [workCarriedOut, setWorkCarriedOut] = useState('');
    const [technicianName, setTechnicianName] = useState('');
    const [technicianSignature, setTechnicianSignature] = useState(null);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [signatureTarget, setSignatureTarget] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [customerSignature, setCustomerSignature] = useState(null);
    const [outstanding, setOutstanding] = useState('');
    const [callout, setCallout] = useState(false);
    const [collectionDelivery, setCollectionDelivery] = useState(false);
    const [noCharge, setNoCharge] = useState(false);
    const [remote, setRemote] = useState(false);
    const [labourCharge, setLabourCharge] = useState('0h 0m');
    
    const [openDocumentsDialog, setOpenDocumentsDialog] = useState(false);
    const slideDirection = location.state?.direction || 'up';
    const [confirmNewCompanyDialogOpen, setConfirmNewCompanyDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [renameDoc, setRenameDoc] = useState(null);
    const [newDocName, setNewDocName] = useState('');
    const [viewDoc, setViewDoc] = useState(null);
    const [docActionMenu, setDocActionMenu] = useState({ anchorEl: null, docId: null });
    const [localDocuments, setLocalDocuments] = useState([]);
    const [showBackButtonDialog, setShowBackButtonDialog] = useState(false);
    const [openPartsPage, setOpenPartsPage] = useState(false);
    const [parts, setParts] = useState([]);
    const [localDocumentToDelete, setLocalDocumentToDelete] = useState(null);
    const partsCharge = parts.reduce((total, part) => total + part.price * part.quantity, 0);

    const taskNames = [
        'Client Logbook Check',
        'OS S/P(s) Update',
        'AS S/P(s) Update',
        'Sys *.tmp cleanup (All)',
        'Anti-Virus Update',
        'Data Backup Check',
        'Internet/Mail Check',
        'NAS - Check / Update',
        'Unifi - Check / Update',
    ];

    const [tasks, setTasks] = useState(taskNames.map(task => ({
        task,
        notes: '',
        check: '',
    })));

    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (user && user.displayName) {
            setTechnicianName(user.displayName);
        }
    }, [user]);

    const [companyAddress, setCompanyAddress] = useState('');
    const [companyTelephone, setCompanyTelephone] = useState('');
    const [contactNameInput, setContactNameInput] = useState('');
    const [contactCellphoneInput, setContactCellphoneInput] = useState('');
    const [contactEmailInput, setContactEmailInput] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            const companiesCollection = collection(db, 'companyProfiles');
            const companiesSnapshot = await getDocs(companiesCollection);
            const companiesList = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCompanies(companiesList);
        };
        fetchCompanies();
    }, []);



    useEffect(() => {
        const fetchInitialData = async () => {
            if (location.state) {
                const {
                    jobNumber,
                    companyName,
                    companyAddress,
                    companyTelephone,
                    contact,
                } = location.state;

                const companiesCollection = collection(db, 'companyProfiles');
                const companiesSnapshot = await getDocs(companiesCollection);
                const companiesList = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const company = companiesList.find(c => c.companyName === companyName);

                if (company) {
                    setSelectedCompany(company);
                    if (contact) {
                        const contactData = company.contacts.find(c => c.name === contact.name);
                        if (contactData) {
                            setSelectedContact(contactData);
                        }
                    }
                }

                setJobNumber(jobNumber);
                setCompanyNameInput(companyName || '');
                setCompanyAddress(companyAddress || '');
                setCompanyTelephone(companyTelephone || '');
                if (contact) {
                    setContactNameInput(contact.name || '');
                    setContactCellphoneInput(contact.cellphone || '');
                    setContactEmailInput(contact.email || '');
                }
            } else {
                const countersRef = doc(db, 'counters', 'jobOrder');
                const countersSnap = await getDoc(countersRef);
                if (countersSnap.exists()) {
                    const data = countersSnap.data();
                    setJobNumber(data.lastJobNumber + 1);
                } else {
                    await setDoc(countersRef, { lastJobNumber: 0 });
                    setJobNumber(1);
                }
            }
        };
        fetchInitialData();
    }, [location.state]);



    useEffect(() => {
        if (selectedCompany) {
            setCompanyNameInput(selectedCompany.companyName);
            setCompanyAddress(selectedCompany.companyAddress || '');
            setCompanyTelephone(selectedCompany.companyTelephone || '');
            if (selectedCompany.contacts && selectedCompany.contacts.length > 0) {
                if (selectedCompany.contacts.length > 1) {
                    // Multiple contacts, do nothing until user selects one
                } else {
                    // Single contact, auto-populate
                    const contact = selectedCompany.contacts[0];
                    setContactNameInput(contact.name || '');
                    setContactCellphoneInput(contact.cellphone || '');
                    setContactEmailInput(contact.email || '');
                }
            } else {
                // No contacts, clear fields
                setContactNameInput('');
                setContactCellphoneInput('');
                setContactEmailInput('');
            }
        } else {
            // No company selected, clear all related fields
            setCompanyAddress('');
            setCompanyTelephone('');
            setContactNameInput('');
            setContactCellphoneInput('');
            setContactEmailInput('');
        }
    }, [selectedCompany]);

    useEffect(() => {
        if (arrivalTime && departureTime) {
            const arrival = new Date(`1970-01-01T${arrivalTime}`);
            const departure = new Date(`1970-01-01T${departureTime}`);
            const diff = departure - arrival;

            if (diff > 0) {
                const totalMinutes = Math.round(diff / 1000 / 60);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                setTotalTime(`${hours}h ${minutes}m`);
            } else {
                setTotalTime('');
            }
        }
    }, [arrivalTime, departureTime]);



    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const handleCompanyChange = (event, newValue) => {
        setSelectedCompany(newValue);
    };

    const handleCompanyInputChange = (event, newInputValue) => {
        setCompanyNameInput(newInputValue);
        if (!newInputValue || !companies.some(comp => comp.companyName === newInputValue)) {
            setSelectedCompany(null);
        }
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    

    const handleViewDocuments = () => {
        setOpenDocumentsDialog(true);
        handleMenuClose();
    };

    const handleOpenPartsPage = () => {
        setOpenPartsPage(true);
        handleMenuClose();
    };

    const navigate = useNavigate();

    const handleBack = () => {
        if (localDocuments.length > 0 || parts.length > 0) {
            setShowBackButtonDialog(true);
        } else {
            navigate('/');
        }
    };

    const handleDeleteLocalDocumentClick = (index) => {
        setLocalDocumentToDelete(index);
    };

    const handleDeleteLocalDocument = () => {
        if (localDocumentToDelete !== null) {
            setLocalDocuments(prevDocs => prevDocs.filter((_, i) => i !== localDocumentToDelete));
            setLocalDocumentToDelete(null);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const promise = new Promise(async (resolve, reject) => {
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                try {
                    const compressedFile = await imageCompression(file, options);
                    const reader = new FileReader();
                    reader.readAsDataURL(compressedFile);
                    reader.onload = () => {
                        const base64 = reader.result;
                        setLocalDocuments(prevDocs => [...prevDocs, {
                            name: file.name,
                            fileType: file.type,
                            base64: base64,
                            uploadedAt: new Date(),
                        }]);
                        resolve();
                    };
                    reader.onerror = (error) => reject(error);
                } catch (error) {
                    reject(error);
                }
            });

            toast.promise(promise, {
                loading: 'Compressing image...',
                success: 'Image uploaded successfully!',
                error: 'Error compressing image.',
            });

        } else if (file.type === 'application/pdf') {
            const promise = new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onload = () => {
                    try {
                        const arrayBuffer = reader.result;
                        const chunkSize = 768 * 1024; // 768KB
                        const chunks = [];
                        for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
                            const chunk = arrayBuffer.slice(i, i + chunkSize);
                            const base64Chunk = btoa(
                                new Uint8Array(chunk)
                                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
                            );
                            chunks.push(base64Chunk);
                        }
                        setLocalDocuments(prevDocs => [...prevDocs, {
                            name: file.name,
                            fileType: file.type,
                            base64Chunks: chunks,
                            uploadedAt: new Date(),
                        }]);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = (error) => reject(error);
            });

            toast.promise(promise, {
                loading: 'Processing PDF...',
                success: 'PDF uploaded successfully!',
                error: 'Error processing PDF.',
            });
        } else {
            toast.error("Unsupported file type.");
        }
    };

    const handleCameraUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const promise = new Promise(async (resolve, reject) => {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            };
            try {
                const compressedFile = await imageCompression(file, options);
                const reader = new FileReader();
                reader.readAsDataURL(compressedFile);
                reader.onload = () => {
                    const base64 = reader.result;
                    setLocalDocuments(prevDocs => [...prevDocs, {
                        name: `Photo-${localDocuments.length + 1}.${file.name.split('.').pop()}`,
                        fileType: file.type,
                        base64: base64,
                        uploadedAt: new Date(),
                    }]);
                    if (cameraInputRef.current) {
                        cameraInputRef.current.value = '';
                    }
                    resolve();
                };
                reader.onerror = (error) => reject(error);
            } catch (error) {
                reject(error);
            }
        });

        toast.promise(promise, {
            loading: 'Compressing photo...',
            success: 'Photo uploaded successfully!',
            error: 'Error compressing photo.',
        });
    };



    const handleRename = (doc, index, isLocal = false) => {
        setRenameDoc({ ...doc, index, isLocal });
        setNewDocName(doc.name);
    };

    const handleRenameClose = () => {
        setRenameDoc(null);
        setNewDocName('');
    };

    const handleRenameSave = async () => {
        if (renameDoc) {
            if (renameDoc.isLocal) {
                setLocalDocuments(prevDocs => prevDocs.map((doc, i) => {
                    if (i === renameDoc.index) {
                        return { ...doc, name: newDocName };
                    }
                    return doc;
                }));
            } 
            handleRenameClose();
        }
    };

    const handleView = (doc) => {
        if (doc.base64Chunks) { // This is a PDF
            const reconstructedBase64 = `data:${doc.fileType};base64,${doc.base64Chunks.join('')}`;
            setViewDoc({ ...doc, base64: reconstructedBase64 });
        } else { // This is an image
            setViewDoc(doc);
        }
    };

    const handleViewClose = () => {
        setViewDoc(null);
    };

    const handleDocActionMenuClick = (event, docId) => {
        setDocActionMenu({ anchorEl: event.currentTarget, docId: docId });
    };

    const handleDocActionMenuClose = () => {
        setDocActionMenu({ anchorEl: null, docId: null });
    };

    const proceedToCreateJobSheet = async (existingCompany = null, createNewCompany = true) => {
        let finalCompanyId = existingCompany?.id || null;
        let finalContacts = existingCompany ? [...(existingCompany.contacts || [])] : [];

        if (!existingCompany && createNewCompany) {
            const newCompanyData = {
                companyName: companyNameInput,
                companyAddress: companyAddress,
                companyTelephone: companyTelephone,
                contacts: [],
            };
            const newCompanyRef = await addDoc(collection(db, 'companyProfiles'), newCompanyData);
            finalCompanyId = newCompanyRef.id;
        }

        const newContact = {
            name: contactNameInput,
            cellphone: contactCellphoneInput,
            email: contactEmailInput,
        };

        if (newContact.name) {
            const contactIndex = finalContacts.findIndex(c => c.name === newContact.name);
            if (contactIndex > -1) {
                finalContacts[contactIndex] = newContact;
            } else {
                finalContacts.push(newContact);
            }

            if (finalCompanyId) {
                await updateDoc(doc(db, 'companyProfiles', finalCompanyId), {
                    contacts: finalContacts,
                    companyAddress: companyAddress,
                    companyTelephone: companyTelephone,
                });
            }
        }

        const jobSheetData = {
            jobNumber, orderType, orderValue, date, companyId: finalCompanyId,
            companyName: companyNameInput, companyAddress: companyAddress,
            companyTelephone: companyTelephone, contact: newContact,
            faultComplaint, arrivalTime, departureTime, totalTime,
            workCarriedOut, technicianName, technicianSignature, customerSignature,
            status: 'Open', createdAt: new Date(),
            tasks,
            outstanding,
            callout,
            collectionDelivery,
            noCharge,
            remote,
            labourCharge,
        };
        
        const promise = addDoc(collection(db, 'jobSheets'), jobSheetData)
            .then((docRef) => {
                const jobSheetId = docRef.id;
                const countersRef = doc(db, 'counters', 'jobOrder');
                const updateCountersPromise = updateDoc(countersRef, {
                    lastJobNumber: jobNumber,
                });

                const uploadDocumentsPromise = Promise.all(localDocuments.map(doc => {
                    return addDoc(collection(db, 'documents'), { ...doc, jobSheetId: jobSheetId, jobNumber: jobNumber });
                }));

                const uploadPartsPromise = Promise.all(parts.map(part => {
                    return addDoc(collection(db, 'parts'), { ...part, jobSheetId: jobSheetId, jobNumber: jobNumber });
                }));

                return Promise.all([updateCountersPromise, uploadDocumentsPromise, uploadPartsPromise]).then(() => jobSheetId);
            });

        toast.promise(promise, {
            loading: 'Creating job sheet...',
            success: async (jobSheetId) => {
                const jobSheetsCollection = collection(db, 'jobSheets');
                const q = query(jobSheetsCollection, where('jobNumber', '==', jobNumber));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.size > 1) {
                    const updatePromises = querySnapshot.docs.map((doc) => {
                        return updateDoc(doc.ref, { status: 'In Progress' });
                    });
                    await Promise.all(updatePromises);
                }
                navigate(`/job-sheet/edit/${jobSheetId}`, { state: { direction: 'left' } });
                return 'Job Sheet created successfully!';
            },
            error: 'Failed to create job sheet. Please try again.',
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!companyNameInput) {
            toast.error('Please enter a company name.');
            return;
        }

        const existingCompany = companies.find(comp => comp.companyName.toLowerCase() === companyNameInput.toLowerCase());

        if (existingCompany) {
            proceedToCreateJobSheet(existingCompany, false);
        } else {
            setConfirmNewCompanyDialogOpen(true);
        }
    };

    return (
        <Box sx={{ maxWidth: 'md', margin: 'auto' }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                bgcolor: theme.palette.background.paper,
                p: 2
            }}>
                <Button variant="outlined" onClick={handleBack} sx={{ mt: 2, mb: 2 }}>Back</Button>
                <Button variant="contained" onClick={handleMenuClick}>{<FlashOnIcon/>}</Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleViewDocuments}>Documents</MenuItem>
                    <MenuItem onClick={handleOpenPartsPage}>Parts List</MenuItem>
                </Menu>
            </Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                New Job Sheet
            </Typography>
            <Slide key={location.key} direction={slideDirection} in={true} mountOnEnter unmountOnExit timeout={300}>
                <Paper sx={{ p: 3, my: 2, mb: 3 }}>
                    <JobSheetForm
                        isEditMode={false}
                        onSubmit={handleSubmit}
                        isSmallScreen={isSmallScreen}
                        orderType={orderType}
                        setOrderType={setOrderType}
                        orderValue={orderValue}
                        setOrderValue={setOrderValue}
                        tasks={tasks}
                        setTasks={setTasks}
                        outstanding={outstanding}
                        setOutstanding={setOutstanding}
                        faultComplaint={faultComplaint}
                        setFaultComplaint={setFaultComplaint}
                        workCarriedOut={workCarriedOut}
                        setWorkCarriedOut={setWorkCarriedOut}
                        arrivalTime={arrivalTime}
                        setArrivalTime={setArrivalTime}
                        departureTime={departureTime}
                        setDepartureTime={setDepartureTime}
                        totalTime={totalTime}

                        technicianName={technicianName}
                        setTechnicianName={setTechnicianName}
                        technicianSignature={technicianSignature}
                        setTechnicianSignature={setTechnicianSignature}
                        customerName={customerName}
                        setCustomerName={setCustomerName}
                        customerSignature={customerSignature}
                        setCustomerSignature={setCustomerSignature}
                        companies={companies}
                        selectedCompany={selectedCompany}
                        handleCompanyChange={handleCompanyChange}
                        companyNameInput={companyNameInput}
                        handleCompanyInputChange={handleCompanyInputChange}
                        companyAddress={companyAddress}
                        setCompanyAddress={setCompanyAddress}
                        companyTelephone={companyTelephone}
                        setCompanyTelephone={setCompanyTelephone}
                        contactNameInput={contactNameInput}
                        setContactNameInput={setContactNameInput}
                        contactCellphoneInput={contactCellphoneInput}
                        setContactCellphoneInput={setContactCellphoneInput}
                        contactEmailInput={contactEmailInput}
                        setContactEmailInput={setContactEmailInput}
                        selectedContact={selectedContact}
                        setSelectedContact={setSelectedContact}
                        orderTypeInputRef={orderTypeInputRef}
                        user={user}
                        showSignaturePad={showSignaturePad}
                        setShowSignaturePad={setShowSignaturePad}
                        signatureTarget={signatureTarget}
                        setSignatureTarget={setSignatureTarget}
                        date={date}
                        setDate={setDate}
                        jobNumber={jobNumber}
                        callout={callout}
                        setCallout={setCallout}
                        collectionDelivery={collectionDelivery}
                        setCollectionDelivery={setCollectionDelivery}
                        noCharge={noCharge}
                        setNoCharge={setNoCharge}
                        remote={remote}
                        setRemote={setRemote}
                        labourCharge={labourCharge}
                        setLabourCharge={setLabourCharge}
                        partsCharge={partsCharge}
                    />
                </Paper>
            </Slide>
            <Dialog
                open={confirmNewCompanyDialogOpen}
                onClose={() => setConfirmNewCompanyDialogOpen(false)}
            >
                <DialogTitle>Create New Company?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        The company "{companyNameInput}" does not exist. Would you like to create a new company profile with the details provided?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={async () => { setConfirmNewCompanyDialogOpen(false); await proceedToCreateJobSheet(null, false); }}>No</Button>
                    <Button onClick={async () => { setConfirmNewCompanyDialogOpen(false); await proceedToCreateJobSheet(null, true); }} autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={showBackButtonDialog}
                onClose={() => setShowBackButtonDialog(false)}
            >
                <DialogTitle>Unsaved Changes</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You have unsaved documents or parts. Are you sure you want to go back? The changes will be lost.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowBackButtonDialog(false)}>Cancel</Button>
                    <Button onClick={() => navigate('/')} autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDocumentsDialog} onClose={() => setOpenDocumentsDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Documents for Job # {jobNumber}
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpenDocumentsDialog(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Button variant="contained" component="label">
                            <CameraAltIcon />
                            <input type="file" accept="image/*" capture="environment" hidden onChange={handleCameraUpload} ref={cameraInputRef} />
                        </Button>
                        <Button variant="contained" component="label">
                            <UploadFileIcon />
                            <input type="file" accept="image/*,application/pdf" hidden onChange={handleFileUpload} />
                        </Button>
                    </Box>

                    {localDocuments.length > 0 && (
                        <>
                            <Typography variant="h6" sx={{ mt: 2 }}>Local Documents</Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>File Name</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {localDocuments.sort((a, b) => a.uploadedAt - b.uploadedAt).map((doc, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{doc.name}</TableCell>
                                                <TableCell>
                                                    {isSmallScreen ? (
                                                        <>
                                                            <IconButton onClick={(e) => handleDocActionMenuClick(e, doc.id)}>
                                                                <FlashOnIcon />
                                                            </IconButton>
                                                            <Menu
                                                                anchorEl={docActionMenu.anchorEl}
                                                                open={docActionMenu.docId === doc.id}
                                                                onClose={handleDocActionMenuClose}
                                                            >
                                                                <MenuItem onClick={() => { handleView(doc); handleDocActionMenuClose(); }}>View</MenuItem>
                                                                <MenuItem onClick={() => { handleRename(doc, index, true); handleDocActionMenuClose(); }}>Rename</MenuItem>
                                                                <MenuItem onClick={() => { handleDeleteLocalDocumentClick(index); handleDocActionMenuClose(); }}>Delete</MenuItem>
                                                            </Menu>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button variant="outlined" onClick={() => handleView(doc)}>View</Button>
                                                            <Button variant="outlined" onClick={() => handleRename(doc, index, true)}>Rename</Button>
                                                            <Button variant="outlined" onClick={() => handleDeleteLocalDocumentClick(index)}>Delete</Button>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={!!renameDoc} onClose={handleRenameClose}>
                <DialogTitle>Rename Document</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Name"
                        type="text"
                        fullWidth
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        onFocus={(event) => event.target.select()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRenameClose}>Cancel</Button>
                    <Button onClick={handleRenameSave}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!viewDoc} onClose={handleViewClose} fullWidth maxWidth="lg">
                {viewDoc && (
                    <>
                        <DialogTitle>{viewDoc.name}</DialogTitle>
                        <DialogContent>
                            {viewDoc.fileType.startsWith('image/') ? (
                                <TransformWrapper initialScale={1}>
                                    <TransformComponent>
                                        <img src={viewDoc.base64} alt={viewDoc.name} style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 250px)' }} />
                                    </TransformComponent>
                                </TransformWrapper>
                            ) : (
                                <PDFViewer file={viewDoc.base64} />
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleViewClose}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
            <Dialog open={localDocumentToDelete !== null} onClose={() => setLocalDocumentToDelete(null)}>
                <DialogTitle>Delete Document</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this document?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLocalDocumentToDelete(null)}>Cancel</Button>
                    <Button onClick={handleDeleteLocalDocument} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
            <PartsPage open={openPartsPage} onClose={() => setOpenPartsPage(false)} jobSheetId={null} jobNumber={jobNumber} currentSheetIndex={0} jobSheets={[]} parts={parts} setParts={setParts} />
        </Box>
    );
}

export default NewJobSheetPage;
