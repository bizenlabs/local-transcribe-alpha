OUTPUT_DIR="server"

cp ./build/bin/whisper-server "$OUTPUT_DIR"
echo "copy whisper-server to $OUTPUT_DIR"
otool -L "$OUTPUT_DIR/whisper-server"

echo "copying libs to $OUTPUT_DIR/libs and changing @rpath to @executable_path/libs for bin files"
libPaths=(
  "./build/src/libwhisper.dylib"
  "./build/src/libwhisper.1.dylib"
  "./build/src/libwhisper.1.7.4.dylib" # maybe not needed
  "./build/src/libwhisper.coreml.dylib"
  "./build/ggml/src/libggml.dylib"
  "./build/ggml/src/libggml-cpu.dylib"
  "./build/ggml/src/libggml-base.dylib"
  "./build/ggml/src/ggml-blas/libggml-blas.dylib"
  "./build/ggml/src/ggml-metal/libggml-metal.dylib"
)
for path in "${libPaths[@]}"; do
  if [ -e "$path" ]; then
    filename=$(basename "$path")

    cp "$path" "$OUTPUT_DIR/libs/$filename"
    install_name_tool -change "@rpath/$filename" "@executable_path/libs/$filename" "$OUTPUT_DIR/whisper-cli"

    echo "change lib @rpath $filename :"
    for p in "${libPaths[@]}"; do
      fname=$(basename "$p")
      install_name_tool -change "@rpath/$fname" "@executable_path/libs/$fname" "$OUTPUT_DIR/libs/$filename"

      echo "check lib self @rpath $fname :"
      if [ "$fname" = "$filename" ]; then
        echo "change lib @rpath $fname :"
        install_name_tool -id "@executable_path/libs/$filename" "$OUTPUT_DIR/libs/$filename"
      fi
    done
    echo "check lib @rpath $fname :"
    otool -L "$OUTPUT_DIR/libs/$filename"
  else
    echo "path '$path' not exist"
  fi
done
echo "check whisper-server again :"
otool -L "$OUTPUT_DIR/whisper-server"
