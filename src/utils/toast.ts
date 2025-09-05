import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
      },
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
      },
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  },
  
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
};

export const handleApiError = (error: any, defaultMessage: string = 'An error occurred') => {
  // Check if it's an authentication error
  if (error?.isAuthError || error?.status === 401 || error?.status === 403) {
    showToast.error('Please login again to perform this action');
    return;
  }
  
  let message = defaultMessage;
  
  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message && error.message !== 'Network Error') {
    message = error.message;
  }
  
  showToast.error(message);
};