// Razorpay utility for loading the Razorpay script

export function loadRazorpay() {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.getElementById('razorpay-script');
    if (existingScript) {
      // Wait for the script to load
      existingScript.onload = () => resolve(window.Razorpay);
      existingScript.onerror = () => reject(new Error('Failed to load Razorpay'));
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
      } else {
        reject(new Error('Razorpay failed to initialize'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Razorpay script'));
    };

    document.head.appendChild(script);
  });
}

export default loadRazorpay;

