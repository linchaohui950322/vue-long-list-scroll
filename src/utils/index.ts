export const defaultRemRate = 37.5

function toRem (value: string | number, rate?: number, minPixel?: number): string
function toRem (
  value: any,
  rate: number = defaultRemRate,
  minPixel: number = 1
): any {
  if ([undefined, null, ''].includes(value)) {
    return value
  }

  if (typeof value === 'number') {
    if (Math.abs(value) <= minPixel) {
      return `${value}px`
    }

    return `${fixed(value / rate)}rem`
  }

  return protectBase64(value, (value) => {
    return value.replace(/-?\d*(\.\d+)?px/g, (str) => {
      const num = parseFloat(str.replace('px', ''))

      // 特殊处理，如果像素数太少则不转换
      if (Math.abs(num) <= minPixel) {
        return `${num}px`
      }

      return `${fixed(num / rate)}rem`
    })
  })
}

function toPixel (value: string | number, rate?: number): string
function toPixel (
  value: any,
  rate: number = defaultRemRate
): any {
  if (typeof value === 'number') {
    return `${value * rate}px`
  }

  return protectBase64(value, (value) => {
    return value.replace(/-?\d*(\.\d+)?rem/g, (str) => {
      const num = parseFloat(str.replace('rem', ''))

      return `${num * rate}px`
    })
  })
}

const cssUtil = {
  toRem,
  toPixel
}

/**
 * @description 防止字符串中的 base64 被意外篡改
 * @param value
 * @param cb
 */
function protectBase64 (value, cb): string {
  const base64Regexp = new RegExp('data:image.*,(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})')

  const base64res = value.match(base64Regexp)

  if (base64res) {
    base64res.forEach((base64, index) => {
      value = value.replace(base64, `$${index}$`)
    })
  }

  value = cb(value)

  if (base64res) {
    base64res.forEach((base64, index) => {
      value = value.replace(`$${index}$`, base64)
    })
  }

  return value
}

function fixed (number) {
  return Math.ceil(number * 1000000) / 1000000
}

export { cssUtil }
