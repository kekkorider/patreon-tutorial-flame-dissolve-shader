varying vec3 vWorldPosition;

void main() {
  #include <begin_vertex>
  #include <project_vertex>

  // Position of the mesh in world space
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
}
