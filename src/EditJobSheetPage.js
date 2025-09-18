import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { Button, Box, useMediaQuery, Slide, Paper, Menu, MenuItem, Dialog, DialogTitle, DialogContent, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, DialogActions, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, query, where, deleteDoc } from 'firebase/firestore';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthContext } from './App';
import toast from 'react-hot-toast';
import { ArrowBack, ArrowForward, FlashOn, CameraAlt as CameraAltIcon, UploadFile as UploadFileIcon, FlashOn as FlashOnIcon } from '@mui/icons-material';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import JobSheetForm from './JobSheetForm';
import PartsListDialog from './PartsListDialog';

function EditJobSheetPage() {
    const orderTypeInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const { id } = useParams();
    const [companies, setCompanies] = useState([]);
    const [companyNameInput, setCompanyNameInput] = useState('');
    const [selectedCompany, setSelectedCompany] = useState(null);

    const [jobNumber, setJobNumber] = useState('');
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
    const [orderType, setOrderType] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [outstanding, setOutstanding] = useState('');
    const [status, setStatus] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [initialInvoiceNumber, setInitialInvoiceNumber] = useState('');
    const [jobSheets, setJobSheets] = useState([]);
    const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
    const location = useLocation();
    const slideDirection = location.state?.direction || 'up';
    const [anchorEl, setAnchorEl] = useState(null);
    const [openDocumentsDialog, setOpenDocumentsDialog] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [renameDoc, setRenameDoc] = useState(null);
    const [newDocName, setNewDocName] = useState('');
    const [viewDoc, setViewDoc] = useState(null);
    const [docActionAnchorEl, setDocActionAnchorEl] = useState(null);
    const [parts, setParts] = useState([]);
    const [openPartsDialog, setOpenPartsDialog] = useState(false);
    const [showAllDocuments, setShowAllDocuments] = useState(false);

    const toggleShowAllDocuments = () => setShowAllDocuments(!showAllDocuments);
    
    
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
        const fetchJobSheet = async () => {
            const docRef = doc(db, 'jobSheets', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setCompanyNameInput(data.companyName || '');
                setCompanyAddress(data.companyAddress || '');
                setCompanyTelephone(data.companyTelephone || '');
                setContactNameInput(data.contact?.name || '');
                setContactCellphoneInput(data.contact?.cellPhone || '');
                setContactEmailInput(data.contact?.email || '');
                setJobNumber(data.jobNumber || '');
                setOrderValue(data.orderValue || '');
                setDate(data.date || new Date().toISOString().slice(0, 10));
                setFaultComplaint(data.faultComplaint || '');
                setArrivalTime(data.arrivalTime || '');
                setDepartureTime(data.departureTime || '');
                setTotalTime(data.totalTime || '');
                setWorkCarriedOut(data.workCarriedOut || '');
                setTechnicianName(data.technicianName || '');
                setTechnicianSignature(data.technicianSignature || null);
                setCustomerName(data.customerName || '');
                setCustomerSignature(data.customerSignature || null);
                setOrderType(data.orderType || 'Order #');
                setTasks(data.tasks || []);
                setOutstanding(data.outstanding || '');
                setStatus(data.status || 'Open');
                setInvoiceNumber(data.invoiceNumber || '');
                setInitialInvoiceNumber(data.invoiceNumber || '');
                setParts(data.parts || []);

                const jobSheetsCollection = collection(db, 'jobSheets');
                const jobSheetsSnapshot = await getDocs(jobSheetsCollection);
                const allJobSheets = jobSheetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const relatedJobSheets = allJobSheets.filter(sheet => sheet.jobNumber === data.jobNumber);
                setJobSheets(relatedJobSheets);
                const newIndex = relatedJobSheets.findIndex(sheet => sheet.id === id);
                setCurrentSheetIndex(newIndex);

                // Fetch and set the selected company
                const companiesCollection = collection(db, 'companyProfiles');
                const companiesSnapshot = await getDocs(companiesCollection);
                const companiesList = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const company = companiesList.find(c => c.companyName === data.companyName);
                if (company) {
                    setSelectedCompany(company);
                    if (data.contact) {
                        const contact = company.contacts.find(c => c.name === data.contact.name);
                        if (contact) {
                            setSelectedContact(contact);
                        }
                    }
                }
            }
        };
        fetchJobSheet();
    }, [id]);

    const fetchDocuments = useCallback(async () => {
        if (showAllDocuments) {
            if (jobNumber) {
                const documentsCollection = collection(db, 'documents');
                const q = query(documentsCollection, where('jobNumber', '==', jobNumber));
                const documentsSnapshot = await getDocs(q);
                setDocuments(documentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        } else {
            if (id) {
                const documentsCollection = collection(db, 'documents');
                const q = query(documentsCollection, where('jobSheetId', '==', id));
                const documentsSnapshot = await getDocs(q);
                setDocuments(documentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        }
    }, [id, jobNumber, showAllDocuments]);

    useEffect(() => {
        if (openDocumentsDialog && id) {
            fetchDocuments();
        }
    }, [openDocumentsDialog, id, fetchDocuments]);

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
                const hours = Math.floor(diff / 1000 / 60 / 60);
                const minutes = Math.floor((diff / 1000 / 60) % 60);
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

    const navigate = useNavigate();

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleAddSheet = () => {
        navigate('/new-job-sheet', {
            state: {
                jobNumber,
                companyName: companyNameInput,
                companyAddress,
                companyTelephone,
                contact: {
                    name: contactNameInput,
                    cellphone: contactCellphoneInput,
                    email: contactEmailInput,
                },
                direction: 'left',
            }
        });
        handleMenuClose();
    };

    const handleViewDocuments = () => {
        setOpenDocumentsDialog(true);
        handleMenuClose();
    };

    const handleOpenPartsDialog = () => {
        setOpenPartsDialog(true);
        handleMenuClose();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const jobSheetRef = doc(db, 'jobSheets', id);
        const jobSheetData = {
            companyName: companyNameInput,
            companyAddress: companyAddress,
            companyTelephone: companyTelephone,
            contact: {
                name: contactNameInput,
                cellphone: contactCellphoneInput,
                email: contactEmailInput,
            },
            date,
            orderType,
            orderValue,
            faultComplaint,
            arrivalTime,
            departureTime,
            totalTime,
            workCarriedOut,
            technicianName,
            technicianSignature,
            customerName,
            customerSignature,
            tasks,
            outstanding,
            invoiceNumber,
            parts,
        };

        const updatePromises = [updateDoc(jobSheetRef, jobSheetData)];

        if (invoiceNumber !== initialInvoiceNumber) {
            const otherSheetsToUpdate = jobSheets.filter(sheet => sheet.id !== id);
            if (otherSheetsToUpdate.length > 0) {
                otherSheetsToUpdate.forEach(sheet => {
                    const otherSheetRef = doc(db, 'jobSheets', sheet.id);
                    updatePromises.push(updateDoc(otherSheetRef, { invoiceNumber }));
                });
            }
        }

        const promise = Promise.all(updatePromises);

        toast.promise(promise, {
            loading: 'Updating job sheet...',
            success: () => {
                return 'Job Sheet updated successfully!';
            },
            error: 'Failed to update job sheet. Please try again.',
        });
    };

    const handleNavigateSheet = (direction) => {
        const newIndex = currentSheetIndex + direction;
        if (newIndex >= 0 && newIndex < jobSheets.length) {
            const slideDir = direction === 1 ? 'left' : 'right';
            navigate(`/job-sheet/edit/${jobSheets[newIndex].id}`, { state: { direction: slideDir } });
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(file, options);
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.onload = async () => {
                const base64 = reader.result;
                await addDoc(collection(db, 'documents'), {
                    jobSheetId: id,
                    name: file.name,
                    fileType: file.type,
                    base64: base64,
                    uploadedAt: new Date(),
                    jobNumber: jobNumber,
                });
                fetchDocuments();
            };
            reader.onerror = (error) => {
                console.error("Error reading file: ", error);
                toast.error("Error reading file.");
            };
        } catch (error) {
            console.error('Error compressing image:', error);
            toast.error('Error compressing image.');
        }
    };

    const handleCameraUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        try {
            const compressedFile = await imageCompression(file, options);
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.onload = async () => {
                const base64 = reader.result;
                await addDoc(collection(db, 'documents'), {
                    jobSheetId: id,
                    name: `camera_${Date.now()}_${file.name}`,
                    fileType: file.type,
                    base64: base64,
                    uploadedAt: new Date(),
                    jobNumber: jobNumber,
                });
                fetchDocuments();
                if (cameraInputRef.current) {
                    cameraInputRef.current.value = '';
                }
            };
            reader.onerror = (error) => {
                console.error("Error reading file: ", error);
                toast.error("Error reading file.");
            };
        } catch (error) {
            console.error('Error compressing image:', error);
            toast.error('Error compressing image.');
        }
    };

    const handleDelete = async (docId) => {
        await deleteDoc(doc(db, 'documents', docId));
        fetchDocuments();
    };

    const handleRename = (doc) => {
        setRenameDoc(doc);
        setNewDocName(doc.name);
    };

    const handleRenameClose = () => {
        setRenameDoc(null);
        setNewDocName('');
    };

    const handleRenameSave = async () => {
        await updateDoc(doc(db, 'documents', renameDoc.id), { name: newDocName });
        fetchDocuments();
        handleRenameClose();
    };

    const handleView = (doc) => {
        setViewDoc(doc);
    };

    const handleViewClose = () => {
        setViewDoc(null);
    };

    const handleDocActionMenuClick = (event) => {
        setDocActionAnchorEl(event.currentTarget);
    };

    const handleDocActionMenuClose = () => {
        setDocActionAnchorEl(null);
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
                <Button variant="outlined" onClick={() => navigate('/view-job-sheet')}>Back</Button>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button variant="outlined" onClick={() => handleNavigateSheet(-1)} disabled={currentSheetIndex === 0}>
                        <ArrowBack />
                    </Button>
                    <Button variant="outlined" disabled>{currentSheetIndex + 1}</Button>
                    <Button variant="outlined" onClick={() => handleNavigateSheet(1)} disabled={currentSheetIndex === jobSheets.length - 1}>
                        <ArrowForward />
                    </Button>
                </Box>
                <Button variant="contained" onClick={handleMenuClick}>
                    <FlashOn />
                </Button>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleAddSheet}>Add Sheet</MenuItem>
                    <MenuItem onClick={handleViewDocuments}>Documents</MenuItem>
                    <MenuItem onClick={handleOpenPartsDialog}>Parts List</MenuItem>
                </Menu>
            </Box>
            <Slide key={id} direction={slideDirection} in={true} mountOnEnter unmountOnExit timeout={300}>
                <Paper sx={{ p: 3, my: 2, mb: 3 }}>
                    <JobSheetForm
                        isEditMode={true}
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
                        status={status}
                        invoiceNumber={invoiceNumber}
                        setInvoiceNumber={setInvoiceNumber}
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
                    />
                </Paper>
            </Slide>

            <Dialog open={openDocumentsDialog} onClose={() => setOpenDocumentsDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Documents for Job # {jobNumber}, <span onClick={toggleShowAllDocuments} style={{cursor: 'pointer', textDecoration: showAllDocuments ? 'line-through' : 'none'}}>Sheet {currentSheetIndex + 1}</span>
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
                            <input type="file" hidden onChange={handleFileUpload} />
                        </Button>
                    </Box>
                    {
                        showAllDocuments ? (
                            Object.entries(documents.reduce((acc, doc) => {
                                const sheetId = doc.jobSheetId || 'unsorted';
                                if (!acc[sheetId]) {
                                acc[sheetId] = [];
                                }
                                acc[sheetId].push(doc);
                                return acc;
                            }, {})).sort(([sheetIdA], [sheetIdB]) => {
                                const sheetIndexA = jobSheets.findIndex(sheet => sheet.id === sheetIdA);
                                const sheetIndexB = jobSheets.findIndex(sheet => sheet.id === sheetIdB);
                                return sheetIndexA - sheetIndexB;
                            }).map(([sheetId, sheetDocuments]) => {
                                const sheetIndex = jobSheets.findIndex(sheet => sheet.id === sheetId);
                                return (
                                <Box key={sheetId} mb={4}>
                                    <Typography variant="h6" gutterBottom>Sheet {sheetIndex + 1}</Typography>
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>File Name</TableCell>
                                                    <TableCell>Uploaded At</TableCell>
                                                    <TableCell>Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {sheetDocuments.map((doc) => (
                                                    <TableRow key={doc.id}>
                                                        <TableCell>{doc.name}</TableCell>
                                                        <TableCell>{new Date(doc.uploadedAt.toDate()).toLocaleString()}</TableCell>
                                                        <TableCell>
                                                            {isSmallScreen ? (
                                                                <>
                                                                    <IconButton onClick={handleDocActionMenuClick}>
                                                                        <FlashOnIcon />
                                                                    </IconButton>
                                                                    <Menu
                                                                        anchorEl={docActionAnchorEl}
                                                                        open={Boolean(docActionAnchorEl)}
                                                                        onClose={handleDocActionMenuClose}
                                                                    >
                                                                        <MenuItem onClick={() => { handleView(doc); handleDocActionMenuClose(); }}>View</MenuItem>
                                                                        <MenuItem onClick={() => { handleRename(doc); handleDocActionMenuClose(); }}>Rename</MenuItem>
                                                                        <MenuItem onClick={() => { handleDelete(doc.id); handleDocActionMenuClose(); }}>Delete</MenuItem>
                                                                    </Menu>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button variant="outlined" onClick={() => handleView(doc)}>View</Button>
                                                                    <Button variant="outlined" onClick={() => handleRename(doc)}>Rename</Button>
                                                                    <Button variant="outlined" onClick={() => handleDelete(doc.id)}>Delete</Button>
                                                                </>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                                )
                            })
                        ) : (
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>File Name</TableCell>
                                            <TableCell>Uploaded At</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {documents.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell>{doc.name}</TableCell>
                                                <TableCell>{new Date(doc.uploadedAt.toDate()).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    {isSmallScreen ? (
                                                        <>
                                                            <IconButton onClick={handleDocActionMenuClick}>
                                                                <FlashOnIcon />
                                                            </IconButton>
                                                            <Menu
                                                                anchorEl={docActionAnchorEl}
                                                                open={Boolean(docActionAnchorEl)}
                                                                onClose={handleDocActionMenuClose}
                                                            >
                                                                <MenuItem onClick={() => { handleView(doc); handleDocActionMenuClose(); }}>View</MenuItem>
                                                                <MenuItem onClick={() => { handleRename(doc); handleDocActionMenuClose(); }}>Rename</MenuItem>
                                                                <MenuItem onClick={() => { handleDelete(doc.id); handleDocActionMenuClose(); }}>Delete</MenuItem>
                                                            </Menu>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button variant="outlined" onClick={() => handleView(doc)}>View</Button>
                                                            <Button variant="outlined" onClick={() => handleRename(doc)}>Rename</Button>
                                                            <Button variant="outlined" onClick={() => handleDelete(doc.id)}>Delete</Button>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )
                    }
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRenameClose}>Cancel</Button>
                    <Button onClick={handleRenameSave}>Save</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!viewDoc} onClose={handleViewClose}>
                <DialogTitle>{viewDoc?.name}</DialogTitle>
                <DialogContent>
                    <TransformWrapper>
                        <TransformComponent>
                            <img src={viewDoc?.base64} alt={viewDoc?.name} style={{ maxWidth: '100%' }} />
                        </TransformComponent>
                    </TransformWrapper>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleViewClose}>Close</Button>
                </DialogActions>
            </Dialog>
            <PartsListDialog open={openPartsDialog} onClose={() => setOpenPartsDialog(false)} parts={parts} setParts={setParts} />
        </Box>
    );
}

export default EditJobSheetPage;