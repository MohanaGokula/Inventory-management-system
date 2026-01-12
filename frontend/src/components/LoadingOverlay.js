import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

export default function LoadingOverlay({inProgress}) {

    return (
        <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={inProgress}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    );
}