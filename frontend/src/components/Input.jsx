const Input = function({type,placeholder,className,...props}){
    return(
    <input type={type} placeholder={placeholder} className={`w-full ${className}`} {...props} />
    )
}

export default Input