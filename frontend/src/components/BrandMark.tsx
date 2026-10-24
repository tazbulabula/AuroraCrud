import { ShoppingBag } from 'lucide-react';

interface BrandMarkProps {
  className?: string;
  iconClassName?: string;
}

const BrandMark = ({
  className = '',
  iconClassName = 'h-5 w-5',
}: BrandMarkProps) => (
  <span className={`inline-flex items-center justify-center ${className}`}>
    <ShoppingBag aria-hidden="true" className={iconClassName} strokeWidth={1.8} />
  </span>
);

export default BrandMark;
