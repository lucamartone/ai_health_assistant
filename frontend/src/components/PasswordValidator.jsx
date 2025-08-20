import { useState, useEffect } from 'react';

function PasswordValidator({ password, onValidationChange }) {
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  });

  useEffect(() => {
    const newValidations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
    };
    
    setValidations(newValidations);
    
    // Notify parent component
    const isValid = Object.values(newValidations).every(Boolean);
    onValidationChange(isValid);
  }, [password, onValidationChange]);

  const getStrengthColor = () => {
    const validCount = Object.values(validations).filter(Boolean).length;
    if (validCount === 0) return 'text-gray-400';
    if (validCount === 1) return 'text-red-500';
    if (validCount === 2) return 'text-orange-500';
    if (validCount === 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStrengthText = () => {
    const validCount = Object.values(validations).filter(Boolean).length;
    if (validCount === 0) return 'Molto debole';
    if (validCount === 1) return 'Debole';
    if (validCount === 2) return 'Media';
    if (validCount === 3) return 'Buona';
    return 'Forte';
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="text-sm">
        <span className="text-gray-600">Forza password: </span>
        <span className={`font-medium ${getStrengthColor()}`}>
          {getStrengthText()}
        </span>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className={`flex items-center gap-2 ${validations.length ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
            validations.length ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {validations.length ? '✓' : '○'}
          </span>
          Almeno 8 caratteri
        </div>
        
        <div className={`flex items-center gap-2 ${validations.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
            validations.uppercase ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {validations.uppercase ? '✓' : '○'}
          </span>
          Almeno una lettera maiuscola
        </div>
        
        <div className={`flex items-center gap-2 ${validations.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
            validations.lowercase ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {validations.lowercase ? '✓' : '○'}
          </span>
          Almeno una lettera minuscola
        </div>
        
        <div className={`flex items-center gap-2 ${validations.number ? 'text-green-600' : 'text-gray-500'}`}>
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
            validations.number ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {validations.number ? '✓' : '○'}
          </span>
          Almeno un numero
        </div>
      </div>
    </div>
  );
}

export default PasswordValidator;
