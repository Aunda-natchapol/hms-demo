import type { FC } from "react";
import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Step,
  Stepper,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import {
  Receipt,
  Payment,
  Logout,
  Person,
  Hotel,
  ShoppingCart,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import checkoutService from "../Services/CheckoutService.ts";
import ConsumptionAddModal from "../Components/ConsumptionAddModal.tsx";

const CheckoutView: FC = observer(() => {
  const {
    activeReservations,
    checkoutSummary,
    currentInvoice,
    payments,
    paymentAmount,
    paymentMethod,
    isLoading,
    isProcessingCheckout,
    isProcessingPayment,
    isReadyForPayment,
    isFullyPaid,
    remainingBalance,
  } = checkoutService;

  const [activeStep, setActiveStep] = useState(0);
  const [selectedReservationId, setSelectedReservationId] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [inspectedRooms, setInspectedRooms] = useState<Set<string>>(new Set());

  // ตรวจสอบว่าห้องไหนมี inspection record แล้วบ้าง
  useEffect(() => {
    const checkInspectedRooms = async () => {
      try {
        const { default: roomInspectionService } = await import('../../RoomInspection/Services/RoomInspectionService');
        const inspected = new Set<string>();

        for (const reservation of activeReservations) {
          const summary = await roomInspectionService.getInspectionSummaryForCheckout(
            reservation.room_id,
            reservation.id
          );

          // ถ้ามี inspection data แสดงว่าตรวจสอบแล้ว
          if (summary.consumptions.length > 0 ||
            summary.damageReports.length > 0 ||
            summary.totalCharges >= 0) {
            inspected.add(reservation.room_id);
          }
        }

        setInspectedRooms(inspected);
      } catch (error) {
        console.error('Failed to check inspected rooms:', error);
      }
    };

    if (activeReservations.length > 0) {
      checkInspectedRooms();
    }
  }, [activeReservations]);

  const steps = ['เลือกแขก', 'ตรวจสอบค่าใช้จ่าย', 'ชำระเงิน', 'เช็คเอาท์สำเร็จ'];

  const handleReservationSelect = async (reservationId: string) => {
    setSelectedReservationId(reservationId);
    if (reservationId) {
      try {
        await checkoutService.generateCheckoutSummary(reservationId);
        setActiveStep(1);
      } catch (error) {
        // แสดง error message ที่ชัดเจน
        const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล';
        alert(errorMessage);
      }
    }
  };

  const handleGenerateInvoice = async () => {
    await checkoutService.generateInvoice();
    setActiveStep(2);
  };

  const handleProcessPayment = async () => {
    try {
      await checkoutService.processPayment();
      if (isFullyPaid) {
        setActiveStep(3);
      }
    } catch (error) {
      alert(`การชำระเงินล้มเหลว: ${error}`);
    }
  };

  const handleCompleteCheckout = async () => {
    try {
      await checkoutService.completeCheckout();
      setShowConfirmDialog(false);
      alert("เช็คเอาท์เสร็จสิ้นแล้ว!");
      setActiveStep(0);
      setSelectedReservationId("");
    } catch (error) {
      alert(`เช็คเอาท์ล้มเหลว: ${error}`);
    }
  };

  const handleAddConsumption = (items: Array<{
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    total: number;
    category: string;
  }>) => {
    console.log('Adding consumption items:', items);
    // TODO: Add items to checkout service
    // This would update the checkoutSummary with new consumption items
    alert(`เพิ่มรายการเรียบร้อย: ${items.length} รายการ มูลค่า ฿${items.reduce((sum, item) => sum + item.total, 0).toLocaleString()}`);

    // Re-generate checkout summary to include new items
    if (selectedReservationId) {
      checkoutService.generateCheckoutSummary(selectedReservationId);
    }
  };

  // Step 1: Guest Selection
  const renderGuestSelection = () => (
    <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
      <CardContent sx={{ background: 'transparent' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Person sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            เลือกแขกสำหรับเช็คเอาท์
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <FormControl fullWidth>
            <InputLabel>การจองที่เช็คอินแล้ว</InputLabel>
            <Select
              value={selectedReservationId}
              onChange={(e) => handleReservationSelect(e.target.value)}
              label="การจองที่เช็คอินแล้ว"
            >
              {activeReservations.map((reservation) => {
                // ตรวจสอบว่าห้องนี้ผ่านการตรวจสอบแล้วหรือยัง
                const isInspected = inspectedRooms.has(reservation.room_id);

                return (
                  <MenuItem key={reservation.id} value={reservation.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1">
                          ห้อง {reservation.room_id} - แขก {reservation.guest_id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          เช็คอิน: {new Date(reservation.arrival_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      {isInspected ? (
                        <Chip
                          size="small"
                          label="✓ ตรวจสอบแล้ว"
                          color="success"
                          sx={{ ml: 1, mr: 1 }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="⚠ ยังไม่ตรวจสอบ"
                          color="error"
                          sx={{ ml: 1, mr: 1 }}
                        />
                      )}
                      <Chip
                        size="small"
                        label={`฿${reservation.total_amount?.toLocaleString()}`}
                        color="primary"
                        sx={{ ml: 0.5 }}
                      />
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        )}
      </CardContent>
    </Card>
  );

  // Step 2: Charges Review with Add Consumption
  const renderChargesReview = () => (
    <Grid container spacing={3}>
      {/* Guest & Room Info */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
          <CardContent sx={{ background: 'transparent' }}>
            <Typography variant="h6" gutterBottom>
              ข้อมูลแขก
            </Typography>
            {checkoutSummary && (
              <>
                <Typography variant="body1">
                  <strong>ชื่อ:</strong> {checkoutSummary.guest.name}
                </Typography>
                <Typography variant="body1">
                  <strong>เบอร์โทร:</strong> {checkoutSummary.guest.phone}
                </Typography>
                <Typography variant="body1">
                  <strong>ห้อง:</strong> {checkoutSummary.room.number}
                </Typography>
                <Typography variant="body1">
                  <strong>วันเช็คอิน:</strong> {new Date(checkoutSummary.reservation.arrival_date).toLocaleDateString()}
                </Typography>
                <Typography variant="body1">
                  <strong>วันเช็คเอาท์:</strong> {new Date(checkoutSummary.reservation.departure_date).toLocaleDateString()}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Quick Add Consumption */}
                <Typography variant="h6" gutterBottom>
                  เพิ่มค่าใช้จ่าย
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  เพิ่มรายการที่แขกใช้ก่อนเช็คเอาท์
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ShoppingCart />}
                  onClick={() => setShowConsumptionModal(true)}
                  size="small"
                >
                  เพิ่มการใช้สินค้า
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Charges Breakdown */}
      <Grid size={{ xs: 12, md: 8 }}>
        <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
          <CardContent sx={{ background: 'transparent' }}>
            <Typography variant="h6" gutterBottom>
              สรุปค่าใช้จ่าย
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>รายการ</TableCell>
                    <TableCell align="right">จำนวน</TableCell>
                    <TableCell align="right">ราคาต่อหน่วย</TableCell>
                    <TableCell align="right">รวม</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Room Charges */}
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Hotel sx={{ mr: 1, fontSize: 20 }} />
                        ค่าห้องพัก
                      </Box>
                    </TableCell>
                    <TableCell align="right">1</TableCell>
                    <TableCell align="right">฿{checkoutSummary?.roomCharges.toLocaleString()}</TableCell>
                    <TableCell align="right">฿{checkoutSummary?.roomCharges.toLocaleString()}</TableCell>
                  </TableRow>

                  {/* Consumption Charges */}
                  {checkoutSummary?.consumptions.map((consumption, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ShoppingCart sx={{ mr: 1, fontSize: 20 }} />
                          มินิบาร์ - {consumption.product_id}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{consumption.quantity}</TableCell>
                      <TableCell align="right">฿{consumption.price.toLocaleString()}</TableCell>
                      <TableCell align="right">฿{(consumption.quantity * consumption.price).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}

                  {/* Damage Charges */}
                  {checkoutSummary?.damageReports.map((damage, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Warning sx={{ mr: 1, fontSize: 20, color: 'warning.main' }} />
                          ค่าเสียหาย: {damage.description}
                        </Box>
                      </TableCell>
                      <TableCell align="right">1</TableCell>
                      <TableCell align="right">฿{damage.final_charge_amount.toLocaleString()}</TableCell>
                      <TableCell align="right">฿{damage.final_charge_amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}

                  {/* Total */}
                  <TableRow>
                    <TableCell colSpan={3} sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      ยอดรวมทั้งหมด
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      ฿{checkoutSummary?.totalAmount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<Receipt />}
                onClick={handleGenerateInvoice}
                size="large"
              >
                สร้างใบแจ้งหนี้
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Step 3: Payment Processing
  const renderPaymentProcessing = () => (
    <Grid container spacing={3}>
      {/* Invoice Details */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
          <CardContent sx={{ background: 'transparent' }}>
            <Typography variant="h6" gutterBottom>
              รายละเอียดใบแจ้งหนี้
            </Typography>
            {currentInvoice && (
              <>
                <Typography variant="body1">
                  <strong>เลขที่ใบแจ้งหนี้:</strong> {currentInvoice.invoice_number}
                </Typography>
                <Typography variant="body1">
                  <strong>จำนวนเงิน:</strong> ฿{currentInvoice.amount.toLocaleString()}
                </Typography>
                <Typography variant="body1">
                  <strong>สถานะ:</strong>
                  <Chip
                    size="small"
                    label={currentInvoice.status === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'}
                    color={currentInvoice.status === 'paid' ? 'success' : 'warning'}
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body1">
                  <strong>วันครบกำหนด:</strong> {new Date(currentInvoice.due_date).toLocaleDateString()}
                </Typography>
              </>
            )}

            {payments.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  ประวัติการชำระ
                </Typography>
                {payments.map((payment, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      การชำระครั้งที่ {index + 1}: ฿{payment.amount.toLocaleString()} ({payment.method === 'cash' ? 'เงินสด' : payment.method === 'card' ? 'บัตร' : 'โอน'})
                    </Typography>
                  </Box>
                ))}
                <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                  คงเหลือ: ฿{remainingBalance.toLocaleString()}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Payment Form */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
          <CardContent sx={{ background: 'transparent' }}>
            <Typography variant="h6" gutterBottom>
              ดำเนินการชำระเงิน
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="จำนวนเงิน"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => checkoutService.setPaymentAmount(Number(e.target.value))}
                  InputProps={{
                    startAdornment: '฿',
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>วิธีการชำระ</InputLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => checkoutService.setPaymentMethod(e.target.value as 'cash' | 'card' | 'transfer')}
                    label="วิธีการชำระ"
                  >
                    <MenuItem value="cash">เงินสด</MenuItem>
                    <MenuItem value="card">บัตรเครดิต</MenuItem>
                    <MenuItem value="transfer">โอนเงิน</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={isProcessingPayment ? <CircularProgress size={20} /> : <Payment />}
                  onClick={handleProcessPayment}
                  disabled={!isReadyForPayment || isProcessingPayment}
                  size="large"
                >
                  {isProcessingPayment ? 'กำลังดำเนินการ...' : 'ชำระเงิน'}
                </Button>
              </Grid>
            </Grid>

            {isFullyPaid && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <strong>ชำระเงินเรียบร้อย!</strong> ชำระค่าใช้จ่ายครบถ้วนแล้ว
              </Alert>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Step 4: Complete Checkout
  const renderCompleteCheckout = () => (
    <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
      <CardContent sx={{ textAlign: 'center', py: 4, background: 'transparent' }}>
        <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          พร้อมเช็คเอาท์
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          ชำระค่าใช้จ่ายครบถ้วนแล้ว สามารถดำเนินการเช็คเอาท์ได้
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={isProcessingCheckout ? <CircularProgress size={20} /> : <Logout />}
          onClick={() => setShowConfirmDialog(true)}
          disabled={isProcessingCheckout}
          sx={{ minWidth: 200 }}
        >
          {isProcessingCheckout ? 'กำลังดำเนินการ...' : 'เช็คเอาท์'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{
      width: '100%',
      maxWidth: 'none',
      bgcolor: 'background.default',
      minHeight: '100vh',
      p: { xs: 2, md: 3 }
    }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        เช็คเอาท์แขก
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        ดำเนินการเช็คเอาท์แขกพร้อมการเรียกเก็บเงินและการชำระเงิน
      </Typography>

      {/* Stepper */}
      <Card sx={{ mb: 3, boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Box sx={{ mb: 3 }}>
        {activeStep === 0 && renderGuestSelection()}
        {activeStep === 1 && renderChargesReview()}
        {activeStep === 2 && renderPaymentProcessing()}
        {activeStep === 3 && renderCompleteCheckout()}
      </Box>

      {/* Navigation */}
      {activeStep > 0 && (
        <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
          <CardContent sx={{ background: 'transparent' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={() => setActiveStep(activeStep - 1)}
                disabled={isProcessingCheckout || isProcessingPayment}
              >
                ย้อนกลับ
              </Button>

              <Button
                variant="outlined"
                onClick={() => {
                  checkoutService.resetCheckout();
                  setActiveStep(0);
                  setSelectedReservationId("");
                }}
                disabled={isProcessingCheckout || isProcessingPayment}
              >
                เริ่มใหม่
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>ยืนยันการเช็คเอาท์</DialogTitle>
        <DialogContent>
          <Typography>
            คุณแน่ใจหรือไม่ที่จะดำเนินการเช็คเอาท์?
            การดำเนินการนี้ไม่สามารถยกเลิกได้
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleCompleteCheckout} variant="contained" autoFocus>
            ยืนยันเช็คเอาท์
          </Button>
        </DialogActions>
      </Dialog>

      {/* Consumption Add Modal */}
      <ConsumptionAddModal
        open={showConsumptionModal}
        onClose={() => setShowConsumptionModal(false)}
        onConfirm={handleAddConsumption}
      />
    </Box>
  );
});

export default CheckoutView;