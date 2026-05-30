// Import necessary hooks from React for state, lifecycle, and references
import { useState, useEffect, useRef } from 'react';
// Import navigation hooks and components from react-router-dom
import { useNavigate, Link } from 'react-router-dom';
// Import the custom useAuth hook to interact with the authentication context
import { useAuth } from '../context/AuthContext';
// Store the local path to the Jessie character image in a constant
const Jessie = '/assets/images/Jessie.png';
// Store the local path to the James character image in a constant
const James = '/assets/images/James.png';

// Define the AuthPage functional component
const AuthPage = () => {
  // Initialize state to toggle between 'login' and 'register' views
  const [variant, setVariant] = useState('login');
  // Initialize state object to hold all form input values
  const [formData, setFormData] = useState({
    // Initialize email field
    email: '',
    // Initialize username field
    username: '',
    // Initialize password field
    password: '',
    // Initialize confirmPassword field for registration
    confirmPassword: '',
  // Close formData initialization
  });
  // Initialize loading state to disable form submission during API calls
  const [isLoading, setIsLoading] = useState(false);
  // Initialize state to toggle password visibility in the UI
  const [showPassword, setShowPassword] = useState(false);
  // Initialize state to hold and display any error messages
  const [error, setError] = useState('');
  // Destructure the login and register functions from the auth context
  const { login, register } = useAuth();
  // Initialize the useNavigate hook to programmatically redirect the user
  const navigate = useNavigate();
  // Create a ref to access the signup background audio element
  const signupAudioRef = useRef(null);
  // Create a ref to access the login background audio element
  const loginAudioRef = useRef(null);

  // Use an effect to reset password visibility when switching between login and register forms
  useEffect(() => {
    // Set showPassword back to false to hide passwords
    setShowPassword(false);
  // Add variant to the dependency array to trigger this effect on form switch
  }, [variant]);

  // Use an effect to handle the signup background music
  useEffect(() => {
    // Exit early if the audio reference is not yet attached to the DOM
    if (!signupAudioRef.current) return;

    // Check if the current view is the registration form
    if (variant === 'register') {
      // Set the signup audio volume to 50%
      signupAudioRef.current.volume = 0.5;
      // Attempt to play the audio and catch any autoplay rejections
      signupAudioRef.current.play().catch(() => {
        // Silently ignore autoplay blocks to prevent console errors
      });
    // If the current view is not registration
    } else {
      // Pause the signup audio
      signupAudioRef.current.pause();
      // Reset the audio playback to the beginning
      signupAudioRef.current.currentTime = 0;
    // Close conditional block
    }
  // Re-run this effect whenever the form variant changes
  }, [variant]);

  // Use an effect to handle the login background music
  useEffect(() => {
    // Exit early if the audio reference is not yet attached to the DOM
    if (!loginAudioRef.current) return;

    // Check if the current view is the login form
    if (variant === 'login') {
      // Set the login audio volume to 50%
      loginAudioRef.current.volume = 0.5;
      // Attempt to play the audio and catch any autoplay rejections
      loginAudioRef.current.play().catch(() => {
        // Silently ignore autoplay blocks to prevent console errors
      });
    // If the current view is not login
    } else {
      // Pause the login audio
      loginAudioRef.current.pause();
      // Reset the audio playback to the beginning
      loginAudioRef.current.currentTime = 0;
    // Close conditional block
    }
  // Re-run this effect whenever the form variant changes
  }, [variant]);

  // Define the main async function to handle form submissions
  const handleSubmit = async (e) => {
    // Prevent the default HTML form submission behavior that reloads the page
    e.preventDefault();
    // Set the loading state to true to disable the submit button
    setIsLoading(true);
    // Clear any previous error messages
    setError('');
    // Use a try block to handle potential API errors
    try {
      // Check if the current form is the login variant
      if (variant === 'login') {
        // Attempt to log the user in using the context function
        const user = await login(formData.email, formData.password);
        // Extract the roles array from the user object, defaulting to an empty array
        const rolesList = user?.roles || [];
        // Check if the user is an admin for potential specific routing (unused here but good practice)
        const isAdmin = rolesList.includes('ROLE_ADMIN') || user?.role === 'ROLE_ADMIN';

        // Navigate the user to the dashboard upon successful login
        navigate('/dashboard');
      // If the current form is the registration variant
      } else {
        // Validate that the email ends with the required domain for lab personnel
        if (!formData.email.endsWith('@pokemon.lab')) {
          // Set an error message if the email domain is invalid
          setError('Only @pokemon.lab emails are allowed.');
          // Reset the loading state
          setIsLoading(false);
          // Exit the function early
          return;
        // Close email validation block
        }
        // Validate that the password and confirm password fields match
        if (formData.password !== formData.confirmPassword) {
          // Set an error message if passwords do not match
          setError('Passwords do not match.');
          // Reset the loading state
          setIsLoading(false);
          // Exit the function early
          return;
        // Close password validation block
        }
        // Attempt to register the user using the context function
        await register(formData.username, formData.email, formData.password);
        // If successful, switch the form variant to login so they can log in
        setVariant('login');
      // Close conditional block
      }
    // Catch any errors thrown during login or registration
    } catch (err) {
      // Safely extract the error message from the nested Axios response or generic Error object
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Something went wrong. Please try again.';
      // Ensure the extracted message is a string before setting state, otherwise provide a fallback
      setError(typeof msg === 'string' ? msg : 'Invalid email or password.');
    // Ensure the loading state is reset regardless of success or failure
    } finally {
      // Set loading state to false
      setIsLoading(false);
    // Close try-catch-finally block
    }
  // Close handleSubmit function
  };

  // Create a boolean helper variable indicating if the current view is login
  const isLogin = variant === 'login';
  // Define the primary blue theme color constant
  const themeBlue = '#2A75BB';
  // Define the primary red theme color constant
  const themeRed = '#e3350d';
  // Determine the current theme color based on the form variant
  const currentTheme = isLogin ? themeBlue : themeRed;
  // Determine the current theme shadow color based on the form variant
  const currentThemeShadow = isLogin ? 'rgba(42, 117, 187, 0.2)' : 'rgba(227, 53, 13, 0.2)';

  // Return the JSX structure for the AuthPage
  return (
    <div
      // Main container with dynamic CSS variables for theming and full screen setup
      style={{
        // Set minimum height to full viewport height
        minHeight: '100vh',
        // Use flexbox for layout
        display: 'flex',
        // Center items vertically
        alignItems: 'center',
        // Center items horizontally
        justifyContent: 'center',
        // Set the primary font family
        fontFamily: "'Outfit', sans-serif",
        // Use relative positioning for absolute children
        position: 'relative',
        // Prevent scrolling from overflowing absolute background elements
        overflow: 'hidden',
        // Inject dynamic theme color as a CSS variable
        '--theme-color': currentTheme,
        // Inject dynamic theme shadow as a CSS variable
        '--theme-shadow': currentThemeShadow
      // Close inline style object
      }}
    >
      { // Signup Background Music Element
      }
      <audio
        // Attach the signup audio ref
        ref={signupAudioRef}
        // Set source file
        src="/assets/pokemon-audio/signup.mp3"
        // Loop continuously
        loop
        // Hide the player element
        style={{ display: 'none' }}
      // Close audio tag
      />
      { // Login Background Music Element
      }
      <audio
        // Attach the login audio ref
        ref={loginAudioRef}
        // Set source file
        src="/assets/pokemon-audio/login.mp3"
        // Loop continuously
        loop
        // Hide the player element
        style={{ display: 'none' }}
      // Close audio tag
      />
      { // Dynamic Crossfade Background - Blue Gradient for Login
      }
      <div style={{
        // Position absolutely to fill the container
        position: 'absolute', inset: 0,
        // Set a linear blue gradient
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        // Show if login view, hide otherwise
        opacity: isLogin ? 1 : 0,
        // Smooth transition for fading in/out
        transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        // Set to back of z-index stack
        zIndex: 0
      // Close inline style object and div tag
      }}></div>
      { // Dynamic Crossfade Background - Red Gradient for Register
      }
      <div style={{
        // Position absolutely to fill the container
        position: 'absolute', inset: 0,
        // Set a linear red gradient
        background: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)',
        // Show if register view, hide otherwise
        opacity: isLogin ? 0 : 1,
        // Smooth transition for fading in/out
        transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        // Set to back of z-index stack
        zIndex: 0
      // Close inline style object and div tag
      }}></div>

      { // Background Decor Container for Images and Concentric Rings
      }
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        { // Pikachu Image Element - Visible during Login on the Left
        }
        <img
          // Source file for Pikachu
          src="/assets/images/3dpikachu.png"
          // Alt text for accessibility
          alt="Pikachu"
          // Inline styles for position, animation, and sizing
          style={{
            // Position absolutely
            position: 'absolute',
            // Anchor near the bottom
            bottom: '-10%',
            // Anchor to the left
            left: '-2%',
            // Set responsive width
            width: '40%',
            // Cap maximum width
            maxWidth: '600px',
            // Set z-index behind login card
            zIndex: 1,
            // Prevent interaction blocking
            pointerEvents: 'none',
            // Transition for sliding and fading
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease',
            // Slide in from left if login, slide out left if register
            transform: isLogin ? 'translateX(0) rotate(-5deg)' : 'translateX(-150%) rotate(-5deg)',
            // Fade in if login, fade out if register
            opacity: isLogin ? 1 : 0,
            // Keep aspect ratio
            objectFit: 'contain',
          // Close inline style object
          }}
        // Close img tag
        />
        { // James Image Element - Visible during Register on the Left
        }
        <img
          // Use imported constant for James source
          src={James}
          // Alt text for accessibility
          alt="James from Team Rocket"
          // Inline styles for position, animation, and sizing
          style={{
            // Position absolutely
            position: 'absolute',
            // Anchor exactly to bottom
            bottom: 0,
            // Anchor to the left
            left: '-1%',
            // Set responsive width
            width: '40%',
            // Cap maximum width
            maxWidth: '560px',
            // Set z-index high enough to sit in front
            zIndex: 100,
            // Prevent interaction blocking
            pointerEvents: 'none',
            // Transition for sliding and fading
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease',
            // Slide out left if login, slide in if register
            transform: isLogin ? 'translateX(-150%)' : 'translateX(0)',
            // Fade out if login, fade in if register
            opacity: isLogin ? 0 : 1,
          // Close inline style object
          }}
        // Close img tag
        />
        { // Jessie Image Element - Visible during Register on the Right
        }
        <img
          // Use imported constant for Jessie source
          src={Jessie}
          // Alt text for accessibility
          alt="Jessie from Team Rocket"
          // Inline styles for position, animation, and sizing
          style={{
            // Position absolutely
            position: 'absolute',
            // Anchor exactly to bottom
            bottom: 0,
            // Anchor to the right
            right: '-4%',
            // Set responsive width
            width: '40%',
            // Cap maximum width
            maxWidth: '560px',
            // Set z-index high enough to sit in front
            zIndex: 100,
            // Prevent interaction blocking
            pointerEvents: 'none',
            // Transition for sliding and fading
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease',
            // Slide out right if login, slide in if register
            transform: isLogin ? 'translateX(150%)' : 'translateX(0)',
            // Fade out if login, fade in if register
            opacity: isLogin ? 0 : 1,
          // Close inline style object
          }}
        // Close img tag
        />
        { // Ash Ketchum Image Element - Visible during Login on the Right
        }
        <img
          // Source file for Ash
          src="/assets/images/ash.png"
          // Alt text for accessibility
          alt="Ash Ketchum"
          // Inline styles for position, animation, and sizing
          style={{
            // Position absolutely
            position: 'absolute',
            // Anchor exactly to bottom
            bottom: 0,
            // Anchor to the right
            right: '-2%',
            // Set responsive width
            width: '40%',
            // Cap maximum width
            maxWidth: '550px',
            // Set z-index
            zIndex: 2,
            // Prevent interaction blocking
            pointerEvents: 'none',
            // Transition for sliding and fading
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease',
            // Slide in if login, slide out right if register
            transform: isLogin ? 'translateX(0)' : 'translateX(150%)',
            // Fade in if login, fade out if register
            opacity: isLogin ? 1 : 0,
          // Close inline style object
          }}
        // Close img tag
        />
        { // Render largest semi-transparent white concentric ring
        }
        <div style={{ position: 'absolute', width: '200vw', height: '200vw', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
        { // Render large semi-transparent white concentric ring
        }
        <div style={{ position: 'absolute', width: '150vw', height: '150vw', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
        { // Render medium semi-transparent white concentric ring
        }
        <div style={{ position: 'absolute', width: '100vw', height: '100vw', border: '2px solid rgba(255,255,255,0.05)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
        { // Render small thick semi-transparent white concentric ring
        }
        <div style={{ position: 'absolute', width: '50vw', height: '50vw', border: '50px solid rgba(255,255,255,0.02)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
      { // Close background decor container
      }
      </div>

      { // Header Container for Logo and Navigation back to Home
      }
      <header style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '2rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50 }}>
        { // Standard a tag link wrapping the logo back to root
        }
        <a href="/" className="logo-link">
          { // Main Pokemon Logo SVG
          }
          <img src="/assets/images/logo.svg" alt="Pokemon" style={{ height: '50px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} />
        { // Close logo link
        }
        </a>
        { // React Router Link button to navigate back to the landing page
        }
        <Link
          // Set target route to root
          to="/"
          // Apply class for specific button styling defined in CSS block below
          className="back-home-link"
        >
          { // Button Text
          }
          Back to Home
        { // Close Link
        }
        </Link>
      { // Close Header
      }
      </header>

      { // Wrapper to center the main form glass card and constrain its width
      }
      <div style={{ display: 'flex', width: '100%', maxWidth: '520px', margin: '0 auto', zIndex: 10, padding: '0 1.5rem', marginTop: '3rem' }}>
        { // The main authentication glass-morphic card container
        }
        <div className="auth-card">

          { // Animated Form Content Container - Keyed by variant to trigger animations on mount/unmount
          }
          <div key={variant} style={{ animation: 'slideUpFade 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            { // Small dynamic badge at the top of the form indicating role/action
            }
            <div style={{
              // Flex layout for alignment
              display: 'inline-flex',
              // Center items
              alignItems: 'center',
              // Spacing between icon and text
              gap: '0.5rem',
              // Inner padding
              padding: '0.5rem 1.25rem',
              // Dynamic background color from CSS variable
              background: 'var(--theme-shadow)',
              // Dynamic text color from CSS variable
              color: 'var(--theme-color)',
              // Pill shape
              borderRadius: '99px',
              // Bold text
              fontWeight: '800',
              // Small text size
              fontSize: '0.875rem',
              // Spacing below the badge
              marginBottom: '1.25rem',
              // Capitalize text
              textTransform: 'uppercase',
              // Wide letter spacing
              letterSpacing: '1px',
              // Transition properties on color change
              transition: 'all 0.5s ease'
            // Close inline style
            }}>
              { // Pokeball icon inside the badge
              }
              <img
                // Source of pokeball icon
                src="/assets/images/icon-pokeball.svg"
                // Style to colorize the SVG based on the theme via CSS filters
                style={{
                  // Set specific width
                  width: '16px',
                  // Slightly transparent
                  opacity: 0.9,
                  // Complex filter chain to tint black SVG to specific hex colors based on current mode
                  filter: isLogin
                    ? 'brightness(0) saturate(100%) invert(29%) sepia(91%) saturate(1732%) hue-rotate(194deg) brightness(95%) contrast(101%)'
                    : 'brightness(0) saturate(100%) invert(27%) sepia(89%) saturate(2864%) hue-rotate(346deg) brightness(95%) contrast(106%)'
                // Close inline style
                }}
                // Empty alt as it is decorative
                alt=""
              // Close img tag
              />
              { // Dynamic text based on variant
              }
              {isLogin ? 'Trainer Access' : 'New Trainer'}
            { // Close badge container
            }
            </div>

            { // Main Form Heading Title
            }
            <h1 style={{ fontSize: '2.5rem', color: '#0f172a', marginBottom: '0.5rem', lineHeight: '1.1', fontWeight: '800', letterSpacing: '-0.5px' }}>
              { // Conditional text based on form type
              }
              {isLogin ? 'Welcome Back!' : 'Join the Adventure!'}
            </h1>
            { // Form Subtitle / Description
            }
            <p style={{ color: '#475569', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
              { // Conditional description based on form type
              }
              {isLogin ? 'Enter your credentials to access your Pokedex.' : 'Create an account to start catching Pokemon.'}
            </p>

            { // Conditionally render error message box if error state is set
            }
            {error && (
              <div
                // Red tinted alert box for displaying errors
                style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '0.75rem 1rem', color: '#b91c1c', fontSize: '0.9rem', fontWeight: '600', textAlign: 'center' }}
              >
                { // Error text with warning emoji
                }
                ⚠️ {error}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', textAlign: 'left' }}>
              { // Render Username input only if in 'register' mode
              }
              {variant === 'register' && (
                <div
                  // Input group wrapper
                  className="auth-input-group"
                >
                  { // Label for Username
                  }
                  <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>Username</label>
                  { // Actual text input for username
                  }
                  <input
                    // Set type to text
                    type="text"
                    // Mark as required field
                    required
                    // Apply standard input class
                    className="auth-input"
                    // Placeholder text
                    placeholder="AshKetchum123"
                    // Update formData state onChange
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  // Close input tag
                  />
                { // Close input group
                }
                </div>
              )}

              { // Email Address Input Group - Rendered for both Login and Register
              }
              <div className="auth-input-group">
                { // Label for Email
                }
                <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                { // Actual email input
                }
                <input
                  // Set HTML5 email type for validation
                  type="email"
                  // Mark as required field
                  required
                  // Apply standard input class
                  className="auth-input"
                  // Placeholder showing expected domain format
                  placeholder="trainer@pokemon.lab"
                  // Update formData state onChange
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                // Close input tag
                />
              { // Close email input group
              }
              </div>

              { // Password Section Input Group - Layout differs between login and register
              }
              <div className="auth-input-group">
                { // Label for Password
                }
                <label style={{ fontSize: '0.875rem', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>Password</label>
                
                { // Conditionally render simple password for Login, or compound password+confirm for Register
                }
                {variant === 'login' ? (
                  <div
                    // Container for simple password input with toggle button
                    style={{ position: 'relative' }}
                  >
                    { // Actual password input for Login
                    }
                    <input
                      // Toggle between text and password types to reveal characters
                      type={showPassword ? 'text' : 'password'}
                      // Mark as required field
                      required
                      // Apply standard input class
                      className="auth-input"
                      // Add right padding so text doesn't overlap the toggle icon
                      style={{ paddingRight: '3rem' }}
                      // Placeholder bullets
                      placeholder="••••••••"
                      // Update formData state onChange
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    // Close password input
                    />
                    { // Button to toggle password visibility
                    }
                    <button
                      // Set type to button to prevent form submission
                      type="button"
                      // Toggle state on click
                      onClick={() => setShowPassword(!showPassword)}
                      // Absolute positioning within the relative container
                      style={{
                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s'
                      }}
                      // Hover effects for color
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--theme-color)'}
                      onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                      // Accessibility label
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      { // Conditionally render eye or eye-slash icon based on state
                      }
                      {showPassword ? (
                        <svg
                          // Eye slash icon (hide)
                          width="20"
                          height="20"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg
                          // Eye open icon (show)
                          width="20"
                          height="20"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                ) : (
                  <div
                    // Container for compound password + confirm password input for Register
                    className={`auth-input-wrapper ${formData.password && formData.password === formData.confirmPassword ? 'match' : ''}`}
                  >
                    { // Relative container for the primary password field
                    }
                    <div style={{ position: 'relative' }}>
                      { // Actual password creation input
                      }
                      <input
                        // Toggle visibility
                        type={showPassword ? 'text' : 'password'}
                        // Required field
                        required
                        // Use inner class that doesn't have its own border, as wrapper handles border
                        className="auth-input-inner"
                        // Add padding to prevent text overlap with button
                        style={{ paddingRight: '3rem' }}
                        // Placeholder text
                        placeholder="Create Password"
                        // Update formData state onChange
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      // Close primary password input
                      />
                      { // Visibility toggle button for primary password field
                      }
                      <button
                        // Prevent form submission
                        type="button"
                        // Toggle visibility state
                        onClick={() => setShowPassword(!showPassword)}
                        // Absolute positioning, ensure z-index to stay above borders
                        style={{
                          position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s', zIndex: 10
                        }}
                        // Hover effects
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--theme-color)'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                        // Accessibility label
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        { // Conditionally render eye icons
                        }
                        {showPassword ? (
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    { // Divider line between password and confirm password
                    }
                    <div style={{ height: '1px', background: '#cbd5e1', margin: '0 1rem' }}></div>
                    { // Relative container for the confirm password field
                    }
                    <div style={{ position: 'relative' }}>
                      { // Actual confirm password input
                      }
                      <input
                        // Toggle visibility
                        type={showPassword ? 'text' : 'password'}
                        // Required field
                        required
                        // Inner class for styling
                        className="auth-input-inner"
                        // Padding to prevent text overlap with icon
                        style={{ paddingRight: '3rem' }}
                        // Placeholder text
                        placeholder="Confirm Password"
                        // Update formData state onChange
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      // Close confirm password input
                      />
                      { // Conditionally render a green checkmark if passwords match and are not empty
                      }
                      {formData.password && formData.password === formData.confirmPassword && (
                        <div
                          // Container for checkmark icon
                          style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#22c55e' }}
                        >
                          { // Green checkmark SVG
                          }
                          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              { // Main Submit Button for the Form
              }
              <button
                // Triggers form submission
                type="submit"
                // Disable button if API request is in flight
                disabled={isLoading}
                // Use custom class for styling
                className="auth-button"
              >
                { // Dynamically display button text based on loading state and form variant
                }
                {isLoading ? 'Processing...' : (isLogin ? 'Start Journey' : 'Create Account')}
              </button>
            </form>

            { // Container for the toggle link to switch between login and register modes
            }
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              { // Button acting as a link to switch variants
              }
              <button
                // Toggle variant state on click
                onClick={() => setVariant(variant === 'login' ? 'register' : 'login')}
                // Apply custom class for link styling with underline animation
                className="toggle-link"
              >
                { // Dynamic text based on current form variant
                }
                {isLogin ? "Don't have an account? Sign up" : "Already a trainer? Log in"}
              </button>
            </div>
          </div>
        </div>
      </div>

      { // Inline style block injecting scoped CSS specifically for the auth page animations and specific components
      // Keyframes for the floating animation on background elements (unused but available)
      // Keyframes for the slide-up and fade-in animation applied to the form on mount/toggle
      // Ensure placeholders have a consistent gray color
      // Styles for the "Back to Home" button
      // Hover state for "Back to Home" button
      // Transition definition for the logo link
      // Hover effect for the logo, adding slight scale and rotation
      // Main card styling with glassmorphism effects
      // Enhance shadow on card hover, incorporating the dynamic theme color
      // Container for form inputs
      // Slight nudge to the right when an input inside the group gains focus
      // Styling for standalone inputs (Username, Email, Login Password)
      // Focus state for standalone inputs
      // Styling for the compound input wrapper used for Register Passwords
      // Focus state for the wrapper
      // Special success state styling when passwords match
      // Styling for the inputs sitting inside the compound wrapper
      // Primary Call-to-Action button styling
      // Setup for a shiny glare effect on hover using a pseudo-element
      // Hover effect for the button
      // Show the glare effect on hover
      // Link styling to toggle between forms
      // Setup for the animated underline effect
      // Fade link slightly on hover
      // Expand the underline on hover
      // Mobile responsive adjustments
      }
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        input::placeholder { color: #94a3b8; }
        
        .back-home-link {
          padding: 0.75rem 2rem;
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          color: var(--theme-color);
          border-radius: 99px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .back-home-link:hover {
          background-color: white;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        }
        .logo-link {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .logo-link:hover {
          transform: scale(1.05) rotate(-2deg);
        }
        
        .auth-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          padding: 3.5rem 3rem;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          transition: box-shadow 0.5s ease;
        }
        .auth-card:hover {
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.4), 0 0 40px var(--theme-shadow);
        }
        
        .auth-input-group {
          position: relative;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .auth-input-group:focus-within {
          transform: translateX(4px);
        }

        .auth-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          border: 2px solid transparent;
          background-color: #f1f5f9;
          color: #0f172a;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
        }
        .auth-input:focus {
          background-color: white;
          border-color: var(--theme-color);
          box-shadow: 0 0 0 4px var(--theme-shadow);
        }

        .auth-input-wrapper {
          border-radius: 12px;
          border: 2px solid transparent;
          background-color: #f1f5f9;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .auth-input-wrapper:focus-within {
          background-color: white;
          border-color: var(--theme-color);
          box-shadow: 0 0 0 4px var(--theme-shadow);
        }
        .auth-input-wrapper.match, .auth-input-wrapper.match:focus-within {
          background-color: white;
          border-color: #22c55e;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
        }
        
        .auth-input-inner {
          width: 100%;
          padding: 1rem 1.25rem;
          background: transparent;
          border: none;
          color: #0f172a;
          font-size: 1rem;
          outline: none;
          font-weight: 500;
        }

        .auth-button {
          margin-top: 1rem;
          padding: 1.25rem;
          background-color: #FFCB05;
          color: #0f172a;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1.125rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 1px;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        .auth-button::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0));
          z-index: -1;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .auth-button:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 15px 30px rgba(255, 203, 5, 0.4);
        }
        .auth-button:hover::after {
          opacity: 1;
        }

        .toggle-link {
          background: none;
          border: none;
          color: var(--theme-color);
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          position: relative;
          text-decoration: none;
          transition: all 0.3s;
          padding-bottom: 2px;
        }
        .toggle-link::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: var(--theme-color);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .toggle-link:hover {
          opacity: 0.8;
        }
        .toggle-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        @media (max-width: 768px) {
          header { padding: 1.5rem !important; }
          .auth-card { padding: 2.5rem 2rem; }
        }
      `}</style>
    </div>
  );
};

// Export the AuthPage component as default
export default AuthPage;