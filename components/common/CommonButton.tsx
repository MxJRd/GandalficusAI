import classNames from "classnames"
import { ReactNode } from "react"

type Borders = 'solid' | 'dotted' | 'none'
type Colors = 'pink' | 'blue'
type Sizes = 'large' | 'medium' | 'small'
type Radii = 'round' | 'large' | 'medium' | 'small'

const fetchBorder = (border: Borders) => {
  switch(border) {
    case 'solid': 
      return 'border border-solid'
    case 'dotted': 
      return 'border border-dotted'
    case 'none': 
      return 'border border-none'

    default: 
      return 'none'
  }
}
const fetchColor = (color: Colors) => {
  switch(color) {
    case 'pink': 
      return 'bg-pink-400 hover:bg-pink-500'
    case 'blue': 
      return 'bg-blue-400 hover:bg-blue-500'

    default: 
      return 'bg-pink-400 hover:bg-pink-500'
  }
}
const fetchSize = (size: Sizes) => {
  switch(size) {
    case "large":
      return 'p-6'
    case "medium":
      return 'p-3'
    case "small":
      return 'p-2'
    default: 
      return 'medium'
  }
}
const fetchRadii = (radii: Radii) => {
  switch(radii) {
    case 'round':
      return 'rounded-full'
    case "large":
      return 'rounded-lg'
    case "medium":
      return 'rounded-md'
    case "small":
      return 'rounded-sm'
    default: 
      return 'rounded-md'
  }
}

interface CustomButtonProps {
  border?: Borders
  color?: Colors
  size?: Sizes
  radius?: Radii
  className?: string
  onClick?: () => void
  children?: ReactNode
}

const CommonButton = ({ className, border = 'solid', color ='pink', size = 'medium', radius ='medium', onClick, children }: CustomButtonProps) => {
  const selectedBorder = fetchBorder(border)
  const selectedColor= fetchColor(color)
  const selectedSize = fetchSize(size)
  const selectedRadii = fetchRadii(radius)

  return (
    <button
      onClick={onClick}
      className={
        classNames(
          className,
          selectedBorder,
          selectedColor,
          selectedSize,
          selectedRadii
      )
    }
    >
      {children}
    </button>
  )
}

export default CommonButton
